import { prisma } from '../../config/db';
import { RegisterInput, LoginInput } from './auth.types';

// TODO: createUser
// Input:  data: RegisterInput
// Output: Promise<User>
// Rule:   Create a new user in the database. 
// Calls:  prisma.user.create
// Edge:   Hash the password before saving.
export async function createUser(data: RegisterInput) {
  // TODO: Implement createUser logic
}

// TODO: validateUser
// Input:  data: LoginInput
// Output: Promise<User | null>
// Rule:   Validate user credentials by email and password.
// Calls:  prisma.user.findUnique
// Edge:   Compare password hash using bcrypt.
export async function validateUser(data: LoginInput) {
  // TODO: Implement validateUser logic
}
