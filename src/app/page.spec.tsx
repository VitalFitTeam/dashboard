import { render, screen } from "@testing-library/react";
import { redirect } from "next/navigation"; // Import redirect
import Page from "./page"; // Assuming this is the main page component

// Mock the redirect function
jest.mock("next/navigation", () => ({
  redirect: jest.fn(),
}));

describe("Page", () => {
  it("renders the main page component without crashing", () => {
    render(<Page />);

    expect(true).toBe(true); // Placeholder assertion
  });
});
