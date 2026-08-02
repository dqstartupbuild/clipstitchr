# Duplicate File History Purge - 2026-08-02

## Scope

The repository contained 137 tracked duplicate files whose final filename
segment matched `* 2.*`. The files were byte-identical duplicates introduced by
an earlier commit. This operation removed those paths from every reachable
local branch and then replaced the matching GitHub branch tips.

No tag existed. No unrelated path was selected by the history filter.

## Method

The repository was rewritten with `git filter-repo` using the inverted path
glob `* 2.*`. The filter rewrote all local branch references. Before updating
GitHub, `git ls-remote` confirmed that each remote branch still pointed to the
exact pre-filter commit recorded by the filter's commit map.

The remote update used an explicit lease for every branch. That made the push
fail closed if any remote tip had changed after the audit.

## Branch Map

| Branch | Previous tip | Filtered tip |
| --- | --- | --- |
| `main` | `fe7b1a72bfb282b619a3955f6c57511707b2cffa` | `63208035212480ea95406e5fae971e8e73239d74` |
| `custom-scheduler` | `fe7b1a72bfb282b619a3955f6c57511707b2cffa` | `63208035212480ea95406e5fae971e8e73239d74` |
| `preview` | `b399e272759026a06bc27bc0bfe4730aa26cabcb` | `2f97c55fe49fa5e0cb96c1b43b20108c60fe88fd` |

## Verification

- `git log --all --name-only` contains no path matching the duplicate suffix.
- GitHub advertises only the filtered tips for the three branch heads.
- A fresh mirror clone, including the three advertised pull-request head refs,
  contains no matching duplicate path in reachable history.
- The repository had no tag refs to rewrite.

The Git host controls garbage collection for unreachable objects left behind by
a force update. The duplicate paths are absent from every advertised reachable
repository ref; host-side pruning time is outside this repository's control.

## Collaborator Action

Any existing clone created before this purge has the old object graph. A
collaborator should preserve uncommitted work, fetch the rewritten branches,
and reset or rebase onto the new tip deliberately. Merging an old branch back
into the rewritten history can reintroduce the removed paths.
