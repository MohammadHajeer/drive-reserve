import assert from "node:assert/strict";
import test from "node:test";

import {
  addDaysToDateOnly,
  dateDifferenceInDays,
  formatDateOnly,
  isValidDateOnly,
  parseDateOnly,
} from "../lib/reservations/reservation-date.ts";

test("date-only values round-trip without UTC date shifts", () => {
  const parsed = parseDateOnly("2026-08-03");

  assert.ok(parsed);
  assert.equal(formatDateOnly(parsed), "2026-08-03");
  assert.equal(isValidDateOnly("2026-02-29"), false);
});

test("one rental day uses the following date as the return boundary", () => {
  const pickup = "2026-08-03";
  const returnBoundary = addDaysToDateOnly(pickup, 1);

  assert.equal(returnBoundary, "2026-08-04");
  assert.equal(dateDifferenceInDays(pickup, returnBoundary), 1);
});

test("the canonical duration permits exactly 30 rental days", () => {
  assert.equal(dateDifferenceInDays("2026-08-03", "2026-09-02"), 30);
  assert.equal(dateDifferenceInDays("2026-08-03", "2026-09-03"), 31);
});

test("adjacent half-open intervals do not overlap", () => {
  const newPickup = "2026-08-03";
  const newReturn = "2026-08-04";
  const existingPickup = "2026-08-04";
  const existingReturn = "2026-08-08";
  const overlaps =
    newPickup < existingReturn && newReturn > existingPickup;

  assert.equal(overlaps, false);
});

