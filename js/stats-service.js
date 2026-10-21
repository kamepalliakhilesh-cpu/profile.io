import https from 'node:https';

let cachedStats = null;
let lastCacheTime = 0;
const CACHE_TTL_MS = 15 * 60 * 1000; // 15 minutes

export async function getCodingStats() {
  const now = Date.now();
  if (cachedStats && (now - lastCacheTime < CACHE_TTL_MS)) {
    return { ...cachedStats, fromCache: true };
  }

  const results = {
    timestamp: now,
    leetcode: {
      solved: 185,
      rating: 1403,
      contests: 2,
      easy: 159,
      medium: 26,
      hard: 0
    },
    codechef: {
      solved: 483,
      rating: 1205,
      contests: 14,
      stars: '1★',
      division: 'Div 4'
    },
    codeforces: {
      rating: 0,
      contests: 0,
      rank: 'Unrated'
    },
    github: {
      repos: 7,
      followers: 2,
      commits: '240+'
    },
    gfg: {
      solved: '35+',
      score: '120+'
    },
    credly: {
      badges: 3
    }
  };

  const tasks = [];

  // 1. Fetch LeetCode
  tasks.push(new Promise((resolve) => {
    const postData = JSON.stringify({
      query: `query getUserProfile($username: String!) {
        matchedUser(username: $username) {
          submitStatsGlobal { acSubmissionNum { difficulty count } }
        }
        userContestRanking(username: $username) {
          attendedContestsCount
          rating
        }
      }`,
      variables: { username: "k_v_akhilesh" }
    });

    const req = https.request('https://leetcode.com/graphql', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData),
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      },
      timeout: 5000
    }, (res) => {
      let data = '';
      res.on('data', c => data += c);
      res.on('end', () => {
        try {
          const json = JSON.parse(data);
          const ac = json.data?.matchedUser?.submitStatsGlobal?.acSubmissionNum;
          if (Array.isArray(ac)) {
            const all = ac.find(x => x.difficulty === 'All');
            const easy = ac.find(x => x.difficulty === 'Easy');
            const med = ac.find(x => x.difficulty === 'Medium');
            const hard = ac.find(x => x.difficulty === 'Hard');
            if (all) results.leetcode.solved = all.count;
            if (easy) results.leetcode.easy = easy.count;
            if (med) results.leetcode.medium = med.count;
            if (hard) results.leetcode.hard = hard.count;
          }
          const contest = json.data?.userContestRanking;
          if (contest) {
            if (contest.rating) results.leetcode.rating = Math.round(contest.rating);
            if (contest.attendedContestsCount) results.leetcode.contests = contest.attendedContestsCount;
          }
        } catch (e) {}
        resolve();
      });
    });
    req.on('error', () => resolve());
    req.on('timeout', () => { req.destroy(); resolve(); });
    req.write(postData);
    req.end();
  }));

  // 2. Fetch CodeChef
  tasks.push(new Promise((resolve) => {
    const req = https.get('https://www.codechef.com/users/k_v_akhilesh', {
      headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' },
      timeout: 5000
    }, (res) => {
      let html = '';
      res.on('data', c => html += c);
      res.on('end', () => {
        try {
          const ratingM = html.match(/class="rating-number">[\s]*([0-9]+)/i);
          const contestsM = html.match(/Contests\s*\(([0-9]+)\)/i);
          const problemsM = html.match(/Total Problems Solved:\s*([0-9]+)/i);
          const divM = html.match(/\(Div\s*([0-9]+)\)/i);

          if (ratingM) results.codechef.rating = parseInt(ratingM[1], 10);
          if (contestsM) results.codechef.contests = parseInt(contestsM[1], 10);
          if (problemsM) results.codechef.solved = parseInt(problemsM[1], 10);
          if (divM) results.codechef.division = 'Div ' + divM[1];
        } catch (e) {}
        resolve();
      });
    });
    req.on('error', () => resolve());
    req.on('timeout', () => { req.destroy(); resolve(); });
  }));

  // 3. Fetch Codeforces
  tasks.push(new Promise((resolve) => {
    const req = https.get('https://codeforces.com/api/user.info?handles=kamepalliakhilesh', {
      headers: { 'User-Agent': 'Mozilla/5.0' },
      timeout: 5000
    }, (res) => {
      let data = '';
      res.on('data', c => data += c);
      res.on('end', () => {
        try {
          const json = JSON.parse(data);
          if (json.status === 'OK' && json.result?.[0]) {
            const u = json.result[0];
            if (u.rating) results.codeforces.rating = u.rating;
            if (u.rank) results.codeforces.rank = u.rank;
          }
        } catch (e) {}
        resolve();
      });
    });
    req.on('error', () => resolve());
    req.on('timeout', () => { req.destroy(); resolve(); });
  }));

  // 4. Fetch GitHub
  tasks.push(new Promise((resolve) => {
    const req = https.get('https://api.github.com/users/kamepalliakhilesh-cpu', {
      headers: { 'User-Agent': 'Node-Portfolio' },
      timeout: 5000
    }, (res) => {
      let data = '';
      res.on('data', c => data += c);
      res.on('end', () => {
        try {
          const json = JSON.parse(data);
          if (json.public_repos !== undefined) results.github.repos = json.public_repos;
          if (json.followers !== undefined) results.github.followers = json.followers;
        } catch (e) {}
        resolve();
      });
    });
    req.on('error', () => resolve());
    req.on('timeout', () => { req.destroy(); resolve(); });
  }));

  await Promise.allSettled(tasks);

  cachedStats = results;
  lastCacheTime = now;
  return { ...cachedStats, fromCache: false };
}
