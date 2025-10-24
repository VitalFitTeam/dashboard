import { render, screen } from "@testing-library/react";
import Navbar from "./layout/Navbar";

describe("Navbar", () => {
  it("renders the Navbar component with essential elements", () => {
    render(<Navbar />);

    // Check for the presence of key text elements
    expect(screen.getByText("Dashboards")).toBeInTheDocument();
    expect(screen.getByText("/ Default")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("Buscar...")).toBeInTheDocument();

    // Check for accessibility labels of icons
    expect(screen.getByLabelText("Notificaciones")).toBeInTheDocument();
    expect(screen.getByLabelText("Cambiar tema")).toBeInTheDocument();
  });
});
