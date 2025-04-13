// import { auth } from "@/config/firebase";
// import { compact } from "lodash";
// import { Pair, Round, MeetupWalk } from "walk2gether-shared";

// export function currentRound(walk: MeetupWalk): Round | undefined {
//   return walk.rounds?.[walk.rounds.length - 1];
// }

// export function userPair(round: Round | undefined) {
//   if (!round) return;
//   const user = auth.currentUser;
//   return round.pairs.find((pair) => pair.users.includes(user!.uid));
// }

// export function allMeetupWalkPairs(walk: MeetupWalk): Pair[] {
//   return compact(walk.rounds.map(userPair));
// }

// export function partnerUid(pair: Pair): string | undefined {
//   return pair.users.find((uid) => uid !== auth.currentUser!.uid);
// }

// export function allMeetupWalkPartnerUids(walk: MeetupWalk): string[] {
//   return compact(allMeetupWalkPairs(walk).map(partnerUid));
// }

// export function userWasInMeetupWalkRounds(walk: MeetupWalk) {
//   return walk.rounds?.some((round) =>
//     round.pairs.some((pair) => pair.users.includes(auth.currentUser!.uid))
//   );
// }
