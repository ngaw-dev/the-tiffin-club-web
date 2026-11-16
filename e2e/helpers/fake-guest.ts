import { faker } from "@faker-js/faker";

// Deterministic per test: seed from the test title so a failure replays with
// the same guest data, while different tests still get distinct identities.
export function seedFaker(title: string): void {
  let hash = 0;
  for (const ch of title) hash = (hash * 31 + ch.charCodeAt(0)) | 0;
  faker.seed(Math.abs(hash));
}

export interface FakeGuest {
  name: string;
  email: string;
}

/** A guest identity for checkout/lookup forms; email is unique per call. */
export function fakeGuest(): FakeGuest {
  return {
    name: faker.person.fullName(),
    email: `e2e-${faker.string.alphanumeric(8).toLowerCase()}@thetiffinclub.test`,
  };
}

/** A fake delivery street address (suburb comes from real settings). */
export function fakeAddress(): string {
  return faker.location.streetAddress(false);
}
