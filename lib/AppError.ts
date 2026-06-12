export class AppError extends Error {
  constructor(
    public readonly code: string,
    public readonly numero: number
  ) {
    super(code);
    this.name = "AppError";
  }
}

// Plages de numéros :
// 1000-1999 validation
// 2000-2999 métier
// 3000-3999 BDD
