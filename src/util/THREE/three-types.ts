import { InteractionGroups } from '@dimforge/rapier3d-compat';
export enum ColliderGroupType {
    None = 0,
    Default = 1,
    Player = 1 << 2,
    Barrier = 1 << 3,
    Area = 1 << 4,
}

export function colliderGroup(g1: ColliderGroupType, g2: ColliderGroupType): InteractionGroups {
    return g1 << 16 | g2;
}

export function getGroupTypeFlag(...groups: ColliderGroupType[]): ColliderGroupType {
    return groups.reduce((acc, group) => acc | group, ColliderGroupType.None);
}