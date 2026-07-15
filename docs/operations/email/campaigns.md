# Loops Campaign Walkthrough

Reviewed: July 15, 2026

Use this guide whenever you want to share ClipStitchr blog posts or send another
one-time marketing email through Loops.

## What a campaign is

A campaign is one marketing email sent once to an audience. Use it for a blog
roundup, product announcement, or other timely update.

Do not use a campaign for:

- A timed email sequence. Use a Workflow.
- A confirmation, receipt, or account message. Use a transactional email.
- An email that should send automatically after every new blog post. Prepare a
  digest and review it first.

## Recommended publishing rhythm

Use one useful digest per week at most:

- Choose one main article.
- Add no more than two supporting articles.
- Skip the week if there is nothing worth sending.
- Keep the email short. Let the articles carry the detail.
- Create a new campaign for every digest so each send has separate reporting.

Publishing a blog post should not automatically send an email. Add the post to
the next digest, review the whole email, and then decide whether to send it.

## Know the Loops audience controls

These controls have different jobs:

| Control | What it does |
| --- | --- |
| Campaign group | Organizes campaigns inside Loops. It does not subscribe contacts or create email preferences. |
| Mailing list | Lets contacts opt into or out of a particular type of marketing email. |
| Filter | Narrows one send using contact properties or previous email activity. |
| Segment | Saves a reusable filter for later sends. |

The production campaign group is named `Newsletters`. The production account
does not currently have a newsletter mailing list. A campaign without a mailing
list or filter is intended for the full eligible marketing audience. Loops will
not send campaigns to contacts marked as unsubscribed.

Do not create a mailing list and silently place existing contacts into it. If
you later want newsletter-specific preferences, first update the signup copy and
consent flow, then add contacts according to what they agreed to receive.

## Before you open Loops

Prepare these items:

- The purpose of the email in one sentence.
- One main article and up to two supporting articles.
- The final published URLs on `clipstitchr.com`.
- A short subject line and preview line.
- The audience you intend to reach.
- A date and time if the campaign should not send immediately.

Confirm every article is live before placing it in an email.

## Create a campaign

### 1. Open the correct team

Sign in to Loops and confirm the active team is the production ClipStitchr team.
Do not create production campaigns in the FollowUs AI development team.

If you want to verify the CLI login without changing anything, run:

```bash
loops auth status -t prod
loops campaigns list -t prod -o json
```

### 2. Start a fresh campaign

Open **Campaigns**, then select **Create campaign**.

You may duplicate a previous weekly digest to reuse its structure. A duplicate
must still be treated as a new campaign. Replace every old date, link, subject,
preview line, and tracking value before sending.

### 3. Name it clearly

Use this internal naming pattern:

```text
ClipStitchr Weekly - [main topic] (YYYY-MM-DD)
```

Example:

```text
ClipStitchr Weekly - Hooks, UGC, and workflows (2026-07-15)
```

Place it in the `Newsletters` campaign group. Remember that this group is only
for organization. It is not an audience or subscription preference.

### 4. Set the sender

Use the approved production sender settings:

- Sender name: `ClipStitchr`
- From address: the verified ClipStitchr sending address shown in Loops
- Reply-to: `support@clipstitchr.com`

Stop if the sender belongs to FollowUs AI, the domain is unverified, or the
reply-to address is incorrect.

### 5. Write the subject and preview

The subject should say what the reader will get. The preview should add context
instead of repeating the subject.

Good example:

```text
Subject: 3 practical ways to make better app ads
Preview: Hooks, believable UGC, and a cleaner short-form workflow.
```

Avoid vague urgency, exaggerated claims, and misleading wording.

### 6. Build the email

Use **Plain** mode unless a campaign genuinely needs a designed layout. Keep the
structure simple:

1. One short opening sentence.
2. The main article with a one-sentence reason to read it.
3. Up to two supporting articles with one sentence each.
4. One link to browse all ClipStitchr articles.
5. A short closing line.

Do not paste full blog posts into the email. Do not mix course lessons,
confirmation copy, or nurture content into a weekly digest.

### 7. Add campaign tracking

Use the same UTM values on every link in one campaign:

```text
utm_source=loops
utm_medium=email
utm_campaign=clipstitchr-weekly-YYYY-MM-DD
```

Example:

```text
https://clipstitchr.com/blog/example-post?utm_source=loops&utm_medium=email&utm_campaign=clipstitchr-weekly-2026-07-15
```

Update the campaign date for every new digest. Check that existing query strings
use `&` before adding another parameter.

### 8. Review the automatic footer

Loops automatically adds the required company and unsubscribe footer to
marketing emails. Confirm it is visible in the preview. Do not imitate or remove
the real unsubscribe link inside the email body.

## Preview and test

### 9. Send a preview

Use the paper-airplane preview control. Send the preview only to a controlled
inbox, such as `dclouwork@gmail.com`.

A preview is not a live campaign send. Do not choose the audience or publish the
campaign until the preview passes.

### 10. Check the received email

Open the actual message and verify:

- The sender says ClipStitchr.
- The subject and preview text make sense together.
- The opening explains why the email is useful.
- Every article link opens the correct production page.
- Every link contains the correct campaign UTM value.
- The message works on desktop and mobile.
- Text remains readable in light and dark email themes.
- There is no course content, confirmation request, attachment, or unrelated promotion.
- The company and unsubscribe footer is present.
- The reply-to address is `support@clipstitchr.com`.

Fix the draft and send another preview if any check fails.

## Choose the audience

### 11. Open the Audience step

Choose **Next** after the email passes its preview.

For a normal ClipStitchr digest, confirm that the selected audience matches the
consent people gave when they joined. If no mailing list, filter, or segment is
selected, expect the campaign to target the full eligible marketing audience.

Use a filter or saved segment when the message is relevant to only part of the
audience. Never manually resubscribe an unsubscribed, bounced, complained, or
deleted contact to make the audience larger.

Loops shows the estimated audience before the final send. Stop if the count is
unexpected and inspect the audience settings.

## Schedule or send

### 12. Choose the delivery time

On the Schedule step, choose one option:

- **Send now** only when the email and audience have received a final review.
- **Schedule** when you want time for one more check or need a specific delivery
  time.

The current production draft uses the `now` setting. Publishing it without
changing that setting can begin the send immediately.

### 13. Complete the final review

Before publishing, confirm all of these:

- Correct ClipStitchr team.
- Correct campaign name and campaign group.
- Correct sender and reply-to address.
- Correct subject and preview text.
- Correct production links and UTM values.
- Successful controlled-inbox preview.
- Correct audience and reasonable audience count.
- Correct time zone and delivery time.
- No secrets, private customer data, or attachments.

Then publish or schedule the campaign.

If a scheduled campaign is wrong, cancel the scheduled send before its delivery
time, correct it, preview it again, and reschedule it. A completed send cannot be
recalled.

## After the send

### 14. Confirm delivery state

Return to Campaigns and confirm the campaign changed from Draft or Scheduled to
Sent. Check that the final recipient count is reasonable.

### 15. Review the result

Review results after roughly 24 hours and again after 72 hours:

- Delivered and bounced messages.
- Clicks on the main and supporting articles.
- Unsubscribes and complaints.
- Replies or support questions.

Treat clicks, replies, complaints, and unsubscribe patterns as more useful than
opens alone. Email privacy features can make open counts unreliable.

Pause future campaign sends and investigate if bounces or complaints rise
unexpectedly.

## When you publish a new blog post

Follow this repeatable process:

1. Publish and verify the article on `clipstitchr.com`.
2. Add it to a short list for the next weekly digest.
3. At the end of the week, choose one main article and up to two supporting ones.
4. Create a new campaign or duplicate the previous digest.
5. Replace all copy, links, dates, and UTM values.
6. Send a controlled-inbox preview.
7. Review the audience and schedule.
8. Send only if the digest is useful on its own.

If this process is automated later, automation should create a Draft campaign
only. Keep preview, audience review, and publishing manual.

## Reaching contacts who missed an earlier campaign

Do not edit or reuse a campaign that has already been sent. Duplicate it, then
filter the new audience using the original campaign's **Not Sent** activity.
Preview and review the duplicate like any other campaign. This avoids sending
the same message again to people who already received it.

## Current production draft

The prepared production draft is:

```text
ClipStitchr Weekly - Hooks, UGC, and workflows (2026-07-15)
```

It is in the `Newsletters` campaign group and remains unsent. Its current
schedule method is `now`, so complete the preview, audience, and final review
steps before publishing it.

## Official Loops references

- [Create and send a campaign](https://loops.so/docs/quickstart)
- [Mailing lists and preference management](https://loops.so/docs/contacts/mailing-lists)
- [Filters and saved segments](https://loops.so/docs/contacts/filters-segments)
- [Email editor and automatic marketing footer](https://loops.so/docs/creating-emails/editor)
- [Contact properties and unsubscribe behavior](https://loops.so/docs/contacts/properties)
- [Transactional email compared with marketing email](https://loops.so/docs/guides/transactional-vs-marketing-email)
- [Send a campaign to contacts who did not receive it](https://loops.so/docs/guides/send-again)
