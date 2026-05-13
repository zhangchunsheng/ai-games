// Fighter state machine states
export enum FighterState {
  IDLE = 'idle',
  WALK_FORWARD = 'walk_forward',
  WALK_BACK = 'walk_back',
  CROUCH = 'crouch',
  JUMP = 'jump',
  JUMP_FORWARD = 'jump_forward',
  JUMP_BACK = 'jump_back',
  ATTACK_LIGHT_PUNCH = 'attack_lp',
  ATTACK_MEDIUM_PUNCH = 'attack_mp',
  ATTACK_HEAVY_PUNCH = 'attack_hp',
  ATTACK_LIGHT_KICK = 'attack_lk',
  ATTACK_MEDIUM_KICK = 'attack_mk',
  ATTACK_HEAVY_KICK = 'attack_hk',
  BLOCK = 'block',
  HIT = 'hit',
  KNOCKDOWN = 'knockdown',
  SUPER = 'super',
}

// Attack states that can cancel into others
export const CANCELABLE_STATES = [
  FighterState.ATTACK_LIGHT_PUNCH,
  FighterState.ATTACK_MEDIUM_PUNCH,
  FighterState.ATTACK_LIGHT_KICK,
  FighterState.ATTACK_MEDIUM_KICK,
];

export interface StateTransition {
  from: FighterState;
  to: FighterState;
  condition: () => boolean;
}

export class StateMachine {
  private currentState: FighterState;
  private previousState: FighterState | null = null;
  private stateEnterTime: number = 0;

  constructor(initialState: FighterState) {
    this.currentState = initialState;
    this.stateEnterTime = Date.now();
  }

  getState(): FighterState {
    return this.currentState;
  }

  getPreviousState(): FighterState | null {
    return this.previousState;
  }

  getTimeInState(): number {
    return Date.now() - this.stateEnterTime;
  }

  canTransition(to: FighterState): boolean {
    const current = this.currentState;

    // Can always return to idle from most states
    if (to === FighterState.IDLE) return true;

    // Can't transition if already in this state
    if (current === to) return false;

    // Can't act during knockdown
    if (current === FighterState.KNOCKDOWN) {
      return false;
    }

    // Can't act during hit stun (except blocking)
    if (current === FighterState.HIT) {
      return to === FighterState.BLOCK;
    }

    // Can cancel certain attacks
    if (CANCELABLE_STATES.includes(current)) {
      return true;
    }

    // Default: allow transition from idle or grounded states
    const groundedStates: FighterState[] = [
      FighterState.IDLE,
      FighterState.WALK_FORWARD,
      FighterState.WALK_BACK,
      FighterState.CROUCH,
    ];
    return groundedStates.includes(current);
  }

  transition(newState: FighterState, force: boolean = false): boolean {
    if (!force && !this.canTransition(newState)) {
      return false;
    }

    this.previousState = this.currentState;
    this.currentState = newState;
    this.stateEnterTime = Date.now();
    return true;
  }

  isAttacking(): boolean {
    return this.currentState.startsWith('attack_') || this.currentState === FighterState.SUPER;
  }

  isGrounded(): boolean {
    return [
      FighterState.IDLE,
      FighterState.WALK_FORWARD,
      FighterState.WALK_BACK,
      FighterState.CROUCH,
      FighterState.BLOCK,
      ...CANCELABLE_STATES,
    ].includes(this.currentState);
  }
}
