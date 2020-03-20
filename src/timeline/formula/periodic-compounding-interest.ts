import { Amount, Currency } from '../../amount';
import { DAYS_PER_YEAR } from '../../calendar-date';
import { Formula } from './formula';

/**
 * Cash invested in a financial vehicle that accrues interest over time.
 */
export class PeriodicCompoundingInterestFormula implements Formula {
  public readonly daysPerPeriod: number;

  constructor(
    public readonly principalSum: Amount,
    public readonly nominalAnnualInterestRate: number, // 1.0 = 100% annual interest.
    public readonly compoundingFrequencyPerYear: number,
  ) {
    this.daysPerPeriod = DAYS_PER_YEAR / compoundingFrequencyPerYear;
  }

  public getCurrency(): Currency {
    return this.principalSum.currency;
  }

  /**
   * https://en.wikipedia.org/wiki/Compound_interest#Periodic_compounding
   */
  public yieldsValueOnDay(day: number): number {
    const isInterestDay = day > 0 && day % this.daysPerPeriod < 1;

    if (!isInterestDay) {
      return 0;
    }

    const periodsAccrued = Math.floor(day / this.daysPerPeriod);

    const nextAccumulation = totalAccumulation(
      this.nominalAnnualInterestRate,
      this.compoundingFrequencyPerYear,
      periodsAccrued / this.compoundingFrequencyPerYear,
    );

    let previousAccumulation = 0;

    if (periodsAccrued > 1) {
      previousAccumulation = totalAccumulation(
        this.nominalAnnualInterestRate,
        this.compoundingFrequencyPerYear,
        (periodsAccrued - 1) / this.compoundingFrequencyPerYear,
      );
    }

    const incrementalAccumulation = nextAccumulation - previousAccumulation;

    // TODO: Is this rounding correct?
    const incrementedValue = Math.floor(
      this.principalSum.value * incrementalAccumulation,
    );

    return incrementedValue;
  }
}

/**
 * @param r is the nominal annual interest rate.
 * @param n is the compounding frequency.
 * @param t is the overall length of time the interest is applied
 *     (expressed using the same time units as r, usually years).
 */
function totalAccumulation(r: number, n: number, t: number): number {
  return Math.pow(1 + r / n, n * t);
}
