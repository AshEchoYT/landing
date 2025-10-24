// Shared type definitions for the application

export interface Seat {
  id: string;
  row: string;
  number: number;
  category: "vip" | "fan-pit" | "general" | "balcony";
  status: "available" | "reserved" | "sold";
  price: number;
}

export interface BackendSeat {
  seatNo: number;
  category: string;
  price: number;
  status: string;
}

// Utility function to convert backend seat format to frontend format
export function convertBackendSeatToFrontend(seatNo: number, category: string, price: number, status: string): Seat {
  // Convert seat number to row and seat number
  // This is a simple mapping - in a real app, this would be based on venue layout
  const rowNumber = Math.floor((seatNo - 1) / 10) + 1;
  let row: string;
  let seatCategory: "vip" | "fan-pit" | "general" | "balcony";

  if (rowNumber === 1) {
    row = "VIP";
    seatCategory = "vip";
  } else if (rowNumber <= 5) {
    row = `Fan Pit ${rowNumber - 1}`;
    seatCategory = "fan-pit";
  } else {
    row = "General";
    seatCategory = "general";
  }

  const seatNumber = ((seatNo - 1) % 10) + 1;

  return {
    id: `${row.toLowerCase().replace(' ', '-')}-${seatNumber}`,
    row,
    number: seatNumber,
    category: seatCategory,
    status: status as "available" | "reserved" | "sold",
    price
  };
}