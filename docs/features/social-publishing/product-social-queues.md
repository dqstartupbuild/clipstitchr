# Product Social Queues and Time Zones

Each product owns one initial queue. New products receive a paused `UTC` queue
with no slots; older products receive the same shape lazily when Product
settings first opens it. A user selects default connected accounts, an IANA
timezone, weekly local day/time slots, and whether the queue is active.

`date-fns` and `date-fns-tz` convert local slots to UTC. Spring-forward times
that do not exist are skipped. A fall-back wall-clock slot becomes one queue
candidate, not two posts. Each candidate has a unique
`productId:scheduledFor` identity. Transactional lookup skips an occupied slot,
so several targets on one logical post still consume only one slot.

Compose offers:

- Post now
- Next product slot
- Choose a time

Exact times never reflow. Queue edits move only future, not-started
`product_queue` posts and only after the user checks the explicit confirmation.
Held or partially started work is untouched. Reflow first releases every
eligible post's old slot identity inside the same Convex transaction, then
assigns the revised queue slots in order. This prevents the posts being moved
from blocking one another with their stale slot keys.

Defaults and environment overrides:

| Control | Default | Variable |
| --- | ---: | --- |
| Future horizon | 90 days | `SOCIAL_SCHEDULING_HORIZON_DAYS` |
| Pending logical posts | 500 | `SOCIAL_MAX_SCHEDULED_POSTS_PER_OWNER` |
| Pending target deliveries | 2,000 | `SOCIAL_MAX_PENDING_DELIVERIES_PER_OWNER` |
| One asset | 500 MiB | `SOCIAL_MAX_ASSET_BYTES` |
| One post | 1 GiB | `SOCIAL_MAX_POST_BYTES` |

Code lives in `web/convex/productSocialQueues/`,
`web/lib/clipstitchr/social/listSocialQueueSlotCandidates.ts`, and
`web/app/_components/settings/ProductSocialQueueEditor.tsx`.
