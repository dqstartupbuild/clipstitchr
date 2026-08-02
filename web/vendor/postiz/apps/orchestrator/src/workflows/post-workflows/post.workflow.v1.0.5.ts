import { PostActivity } from '@gitroom/orchestrator/activities/post.activity';
import {
  ActivityFailure,
  ApplicationFailure,
  proxyActivities,
  sleep,
  defineSignal,
  setHandler,
} from '@temporalio/workflow';
import dayjs from 'dayjs';
import { Integration } from '@prisma/client';
import { PostResponse } from '@gitroom/nestjs-libraries/integrations/social/social.integrations.interface';

const proxyTaskQueue = (taskQueue: string) => {
  return proxyActivities<PostActivity>({
    startToCloseTimeout: '10 minute',
    taskQueue,
    retry: {
      maximumAttempts: 3,
      backoffCoefficient: 1,
      initialInterval: '2 minutes',
    },
  });
};

const {
  getPostsList,
  getPost,
  changeState,
  updatePost,
  isCommentable,
} = proxyActivities<PostActivity>({
  startToCloseTimeout: '10 minute',
  retry: {
    maximumAttempts: 3,
    backoffCoefficient: 1,
    initialInterval: '2 minutes',
  },
});

const poke = defineSignal('poke');

const iterate = Array.from({ length: 5 });

export async function postWorkflowV105({
  taskQueue,
  postId,
  organizationId,
  postNow = false,
}: {
  taskQueue: string;
  postId: string;
  organizationId: string;
  postNow?: boolean;
}) {
  // Dynamic task queue, for concurrency
  const {
    postSocial,
    postComment,
    refreshTokenWithCause,
  } = proxyTaskQueue(taskQueue);

  let poked = false;
  setHandler(poke, () => {
    poked = true;
  });

  // get all the posts and comments to post
  const firstPost = await getPost(organizationId, postId);

  // in case doesn't exists for some reason, fail it
  if (!firstPost) {
    await changeState(postId, 'ERROR', 'No Post');
    return;
  }

  if (!postNow && firstPost.state !== 'QUEUE') {
    await changeState(firstPost.id, 'ERROR', 'Already posted', [firstPost]);
    return;
  }

  // if it's a repeatable post, we should ignore this.
  if (!postNow) {
    await sleep(
      dayjs(firstPost.publishDate).isBefore(dayjs())
        ? 0
        : dayjs(firstPost.publishDate).diff(dayjs(), 'millisecond')
    );
  }

  const postsListBefore = await getPostsList(organizationId, postId);
  const [post] = postsListBefore;

  if (!post) {
    await changeState(postId, 'ERROR', 'No Post');
    return;
  }

  // if refresh is needed from last time, let's inform the user
  if (post.integration?.refreshNeeded) {
    await changeState(
      postsListBefore[0].id,
      'ERROR',
      'Refresh channel needed',
      postsListBefore
    );
    return;
  }

  // if it's disabled, inform the user
  if (post.integration?.disabled) {
    await changeState(
      postsListBefore[0].id,
      'ERROR',
      'Channel disabled',
      postsListBefore
    );
    return;
  }

  // Do we need to post comment for this social?
  const toComment: boolean =
    postsListBefore.length === 1
      ? false
      : await isCommentable(post.integration);

  const postsList = toComment ? postsListBefore : [postsListBefore[0]];

  // list of all the saved results
  const postsResults: PostResponse[] = [];

  // iterate over the posts
  for (let i = 0; i < postsList.length; i++) {
    const before = postsResults.length;
    // this is a small trick to repeat an action in case of token refresh
    for (const _ of iterate) {
      try {
        // first post the main post
        if (i === 0) {
          postsResults.push(
            ...(await postSocial(post.integration as Integration, [
              postsList[i],
            ]))
          );

          // then post the comments if any
        } else {
          if (postsList[i].delay) {
            await sleep(60000 * Math.max(0, Number(postsList[i].delay ?? 0)));
          }

          postsResults.push(
            ...(await postComment(
              postsResults[0].postId,
              postsResults.length === 1
                ? undefined
                : postsResults[i - 1].postId,
              post.integration,
              [postsList[i]]
            ))
          );
        }

        // mark post as successful
        await updatePost(
          postsList[i].id,
          postsResults[i].postId,
          postsResults[i].releaseURL
        );

        // break the current while to move to the next post
        break;
      } catch (err) {
        // if token refresh is needed, do it and repeat
        if (
          err instanceof ActivityFailure &&
          err.cause instanceof ApplicationFailure &&
          err.cause.type === 'refresh_token'
        ) {
          const refresh = await refreshTokenWithCause(
            post.integration,
            err?.cause?.message || ''
          );
          if (!refresh || !refresh.accessToken) {
            await changeState(postsList[0].id, 'ERROR', err, postsList);
            return false;
          }

          post.integration.token = refresh.accessToken;
          continue;
        }

        // for other errors, change state and inform the user if needed
        await changeState(postsList[0].id, 'ERROR', err, postsList);

        // specific case for bad body errors
        if (
          err instanceof ActivityFailure &&
          err.cause instanceof ApplicationFailure &&
          err.cause.type === 'bad_body'
        ) {
          return false;
        }
      }
    }

    if (postsResults.length === before) {
      // all retries exhausted without success
      return false;
    }
  }

}
