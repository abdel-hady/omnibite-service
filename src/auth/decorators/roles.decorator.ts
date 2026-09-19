import { SetMetadata } from '@nestjs/common';

export enum Role {
  UserCustomer = 'UserCustomer',
  UserRestaurant = 'UserRestaurant',
  Admin = 'Admin',
}

export const ROLES_KEY = 'roles';
export const Roles = (...roles: Role[]) => SetMetadata(ROLES_KEY, roles);
