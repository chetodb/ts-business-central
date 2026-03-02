/**
 * Fluent builder for OData $filter expressions.
 *
 * @example
 * const filter = BcFilter.build()
 *   .eq('Status', 'Open')
 *   .ge('Amount', 100)
 *   .contains('Name', 'test');
 *
 * // => "Status eq 'Open' and Amount ge 100 and contains(Name, 'test')"
 */
export class BcFilter {
  private filterStrings: string[] = [];

  /** Creates a new filter builder instance. */
  static build(): BcFilter {
    return new BcFilter();
  }

  /** Adds an equality condition: `field eq value`. */
  eq(field: string, value: string | number | boolean | null): this {
    return this.pushCondition(`${field} eq ${this.formatValue(value)}`);
  }

  /** Adds a not-equal condition: `field ne value`. */
  ne(field: string, value: string | number | boolean | null): this {
    return this.pushCondition(`${field} ne ${this.formatValue(value)}`);
  }

  /** Adds a greater-than condition: `field gt value`. */
  gt(field: string, value: string | number | boolean | Date): this {
    return this.pushCondition(`${field} gt ${this.formatValue(value)}`);
  }

  /** Adds a greater-or-equal condition: `field ge value`. */
  ge(field: string, value: string | number | boolean | Date): this {
    return this.pushCondition(`${field} ge ${this.formatValue(value)}`);
  }

  /** Adds a less-than condition: `field lt value`. */
  lt(field: string, value: string | number | boolean | Date): this {
    return this.pushCondition(`${field} lt ${this.formatValue(value)}`);
  }

  /** Adds a less-or-equal condition: `field le value`. */
  le(field: string, value: string | number | boolean | Date): this {
    return this.pushCondition(`${field} le ${this.formatValue(value)}`);
  }

  /**
   * Checks if a field contains a substring: `contains(field, value)`.
   * NOTE: May return 501 on Page-type Web Services in Business Central.
   */
  contains(field: string, value: string): this {
    return this.pushCondition(`contains(${field}, ${this.formatValue(value)})`);
  }

  /** Checks if a field starts with a string: `startswith(field, value)`. */
  startsWith(field: string, value: string): this {
    return this.pushCondition(`startswith(${field}, ${this.formatValue(value)})`);
  }

  /** Checks if a field ends with a string: `endswith(field, value)`. */
  endsWith(field: string, value: string): this {
    return this.pushCondition(`endswith(${field}, ${this.formatValue(value)})`);
  }

  /** Shorthand for an inclusive range: `(field ge from and field le to)`. */
  between(
    field: string,
    from: string | number | boolean | Date,
    to: string | number | boolean | Date,
  ): this {
    return this.group(BcFilter.build().ge(field, from).le(field, to));
  }

  /** Wraps a field with `tolower()` for case-insensitive comparisons. */
  toLower(field: string): string {
    return `tolower(${field})`;
  }

  /** Wraps a field with `toupper()` for case-insensitive comparisons. */
  toUpper(field: string): string {
    return `toupper(${field})`;
  }

  /**
   * Checks if a field value is in a set of values: `field in ('a','b')`.
   * NOTE: Only supported in recent Business Central versions with schemaversion 2.1 or later.
   * May return 501 on older versions or Page-type Web Services.
   */
  in(field: string, values: (string | number)[]): this {
    if (values.length === 0) return this;
    const formattedValues = values.map((v) => this.formatValue(v)).join(',');
    return this.pushCondition(`${field} in (${formattedValues})`);
  }

  /** Adds a raw filter string as-is. */
  raw(customString: string): this {
    return this.pushCondition(customString);
  }

  /** Explicit AND operator (optional — conditions are auto-joined with AND). */
  and(): this {
    this.filterStrings.push('and');
    return this;
  }

  /** OR operator. */
  or(): this {
    this.filterStrings.push('or');
    return this;
  }

  /** Groups sub-conditions in parentheses. */
  group(subFilter: BcFilter): this {
    return this.pushCondition(`(${subFilter.toString()})`);
  }

  /** Returns the final OData $filter string. */
  toString(): string {
    return this.filterStrings.join(' ');
  }

  /**
   * Auto-inserts 'and' between consecutive conditions if no explicit
   * logical operator was placed.
   */
  private pushCondition(condition: string): this {
    if (this.filterStrings.length > 0) {
      const last = this.filterStrings[this.filterStrings.length - 1];
      if (last !== 'and' && last !== 'or') {
        this.filterStrings.push('and');
      }
    }
    this.filterStrings.push(condition);
    return this;
  }

  /** Formats a value according to OData syntax rules. */
  private formatValue(value: string | number | boolean | Date | null): string {
    if (value === null) return 'null';
    if (typeof value === 'string') return `'${value}'`;
    if (value instanceof Date) return value.toISOString();
    return String(value);
  }
}
