export type FineStatus = "pending" | "accepted" | "reversed" | "skipped";
export type VoteType = "accept" | "reverse";

export interface TeamMember {
  id: number;
  name: string;
  createdAt: string;
  active: boolean;
}

export interface Fine {
  id: number;
  reason: string;
  fineDate: string | null;
  createdAt: string;
  status: FineStatus;
  reversedToMemberId: number | null;
  eventProcessedAt: string | null;
  fineMembers: {
    member: TeamMember;
  }[];
  reversedToMember?: TeamMember | null;
}

export interface EventVote {
  id: number;
  fineId: number;
  sessionId: string;
  vote: VoteType;
  createdAt: string;
}

export interface FineWithVotes extends Fine {
  votes: EventVote[];
  acceptCount: number;
  reverseCount: number;
}

export interface Stats {
  memberId: number;
  memberName: string;
  totalFines: number;
  acceptedFines: number;
  reversedFines: number;
  reversedToCount: number;
}
