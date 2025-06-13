export class ReportListException extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ReportListException';
  }
} 