import firestore, { Timestamp } from "@react-native-firebase/firestore";
import { MeetupWalk, Round, Walk, WithId } from "walk2gether-shared";

/**
 * Starts the next upcoming round for a meetup walk
 * @param walk - The walk document with upcoming rounds
 * @returns Promise that resolves when the round is started
 */
export async function startNextRound(walk: WithId<Walk>): Promise<void> {
  if (!walk._ref || walk.type !== "meetup") {
    throw new Error("Can only start rounds for meetup walks");
  }

  const meetupWalk = walk as WithId<MeetupWalk>;
  const upcomingRounds = meetupWalk.upcomingRounds || [];
  const nextRound = upcomingRounds[0];

  if (!nextRound) {
    console.log("No upcoming rounds to start");
    return;
  }

  // Calculate duration from backend timestamps or fallback to minimum
  let durationMinutes = meetupWalk.minimumNumberOfMinutesWithEachPartner || 5;

  if (nextRound.startTime && nextRound.endTime) {
    const startTime = nextRound.startTime.toDate();
    const endTime = nextRound.endTime.toDate();
    durationMinutes = Math.round(
      (endTime.getTime() - startTime.getTime()) / (1000 * 60)
    );
  }

  await startRoundWithDuration(walk, durationMinutes);
}

/**
 * Starts a round with a specific duration
 * @param walk - The walk document
 * @param durationMinutes - Duration of the round in minutes
 */
async function startRoundWithDuration(
  walk: WithId<Walk>,
  durationMinutes: number
): Promise<void> {
  if (!walk._ref || walk.type !== "meetup") {
    throw new Error("Can only start rounds for meetup walks");
  }

  const meetupWalk = walk as WithId<MeetupWalk>;
  const upcomingRounds = meetupWalk.upcomingRounds || [];
  const nextRound = upcomingRounds[0];

  if (!nextRound) {
    console.log("No upcoming rounds to start");
    return;
  }

  try {
    // Create the round document in Firestore
    const roundData: Omit<Round, "id"> = {
      roundNumber: nextRound.roundNumber,
      pairs: nextRound.pairs,
      questionPrompt: nextRound.questionPrompt,
      walkId: walk.id,
      startTime: Timestamp.now(),
      endTime: Timestamp.fromDate(
        new Date(Date.now() + durationMinutes * 60 * 1000)
      ),
    };

    await firestore().runTransaction(async (transaction) => {
      // Add the round document
      const roundRef = firestore().collection("temp").doc(); // Get a new doc reference
      transaction.set(
        firestore()
          .collection("walks")
          .doc(walk.id)
          .collection("rounds")
          .doc(roundRef.id),
        roundData
      );

      // Remove the first upcoming round and update the walk
      const updatedUpcomingRounds = [...upcomingRounds];
      updatedUpcomingRounds.shift();

      transaction.update(walk._ref as any, {
        upcomingRounds: updatedUpcomingRounds,
      });
    });

    console.log("Round started successfully");
  } catch (error) {
    console.error("Error starting round:", error);
    throw error;
  }
}
