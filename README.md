# Keyed Promise
Use the Promise.all and Promise.allSettled concurrency methods with type safe objects for more reliable control.

## Why?
Sometimes you want to get the result of Promise.all or Promise.allSettled with type safe keys.

For example, you might want to dynamically build a list of promises.
```typescript
async function fetchUserDetails(userId: string, includeProfile = false, includePosts = false, includeFollowers = false) {
  const promises: Promise<any>[] = [];
  const keys: string[] = [];

  if (includeProfile) {
    promises.push(fetchProfile(userId));
  }

  if (includePosts) {
    promises.push(fetchPosts(userId));
  }

  if (includeFollowers) {
    promises.push(fetchFollowers(userId));
  }

  const results = await Promise.all(promises);

  // now how do we know what's in the results?
}
```

```typescript
import kp from 'keyed-promise';

async function fetchUserDetails(userId: string, includeProfile = false, includePosts = false, includeFollowers = false) {

  const promises = {};

  if (includeProfile) {
    promises.profile = fetchProfile(userId);
  }

  if (includePosts) {
    promises.posts = fetchPosts(userId);
  }

  if (includeFollowers) {
    promises.followers = fetchFollowers(userId);
  }

  const results = await kp.all(promises);

  // now we can see what's in the results
  if(results.profile) {
    // do something with profile
  }
}
```

## Installation

```bash
npm install keyed-promise
```


## Usage

### all

.all will behave like Promise.all, but with type safe keys.

```typescript
const results = await kp.all(promises);
```

### allSettled

.allSettled will behave like Promise.allSettled, but with type safe keys.

```typescript
const results = await kp.allSettled(promises);
```
