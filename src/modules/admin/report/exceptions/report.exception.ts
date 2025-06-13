export class ReportGenerationException extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ReportGenerationException';
  }
} 