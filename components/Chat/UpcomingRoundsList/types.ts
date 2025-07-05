import { Round, Pair } from 'walk2gether-shared';

export interface UserInfo {
  displayName: string;
  photoURL?: string;
  uid: string;
}

export interface PairWithUsers extends Pair {
  users?: UserInfo[];
}
