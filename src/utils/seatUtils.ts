/**
 * Utility functions for seat management and numbering
 */

export interface SeatPosition {
  row: string;
  number: number;
}

export interface SeatInfo {
  seatNo: number;
  row: string;
  number: number;
  category: string;
  price: number;
}

/**
 * Convert row name and seat number to a unique seat number
 * Seat numbering scheme:
 * - VIP: 1-10
 * - Fan Pit 1: 11-20
 * - Fan Pit 2: 21-30
 * - Fan Pit 3: 31-40
 * - Fan Pit 4: 41-50
 * - General: 51-60
 */
export function getSeatNo(row: string, seatNumber: number): number {
  const rowMapping: { [key: string]: number } = {
    'VIP': 0,
    'Fan Pit 1': 1,
    'Fan Pit 2': 2,
    'Fan Pit 3': 3,
    'Fan Pit 4': 4,
    'General': 5
  };

  const rowIndex = rowMapping[row];
  if (rowIndex === undefined) {
    throw new Error(`Invalid row: ${row}`);
  }

  if (seatNumber < 1 || seatNumber > 10) {
    throw new Error(`Invalid seat number: ${seatNumber}. Must be between 1 and 10.`);
  }

  return rowIndex * 10 + seatNumber;
}

/**
 * Convert seat number back to row and seat number
 */
export function getSeatPosition(seatNo: number): SeatPosition {
  if (seatNo < 1 || seatNo > 60) {
    throw new Error(`Invalid seat number: ${seatNo}. Must be between 1 and 60.`);
  }

  const rowIndex = Math.floor((seatNo - 1) / 10);
  const seatNumber = ((seatNo - 1) % 10) + 1;

  const rowNames = ['VIP', 'Fan Pit 1', 'Fan Pit 2', 'Fan Pit 3', 'Fan Pit 4', 'General'];
  const row = rowNames[rowIndex];

  return { row, number: seatNumber };
}

/**
 * Get category from row name
 */
export function getCategoryFromRow(row: string): string {
  const categoryMapping: { [key: string]: string } = {
    'VIP': 'vip',
    'Fan Pit 1': 'fan-pit',
    'Fan Pit 2': 'fan-pit',
    'Fan Pit 3': 'fan-pit',
    'Fan Pit 4': 'fan-pit',
    'General': 'general'
  };

  return categoryMapping[row] || 'general';
}

/**
 * Get price from category
 */
export function getPriceFromCategory(category: string): number {
  const priceMapping: { [key: string]: number } = {
    'vip': 20800,
    'fan-pit': 15000,
    'general': 10000,
    'balcony': 12500
  };

  return priceMapping[category] || 10000;
}

/**
 * Create seat info object from row and seat number
 */
export function createSeatInfo(row: string, seatNumber: number): SeatInfo {
  const seatNo = getSeatNo(row, seatNumber);
  const category = getCategoryFromRow(row);
  const price = getPriceFromCategory(category);

  return {
    seatNo,
    row,
    number: seatNumber,
    category,
    price
  };
}

/**
 * Generate all seats for the venue
 */
export function generateAllSeats(): SeatInfo[] {
  const seats: SeatInfo[] = [];
  const rows = ['VIP', 'Fan Pit 1', 'Fan Pit 2', 'Fan Pit 3', 'Fan Pit 4', 'General'];

  rows.forEach(row => {
    for (let seatNum = 1; seatNum <= 10; seatNum++) {
      seats.push(createSeatInfo(row, seatNum));
    }
  });

  return seats;
}

/**
 * Validate seat number format
 */
export function isValidSeatNo(seatNo: number): boolean {
  return seatNo >= 1 && seatNo <= 60;
}

/**
 * Get row name from seat number
 */
export function getRowFromSeatNo(seatNo: number): string {
  return getSeatPosition(seatNo).row;
}

/**
 * Get seat number within row from absolute seat number
 */
export function getSeatNumberFromSeatNo(seatNo: number): number {
  return getSeatPosition(seatNo).number;
}