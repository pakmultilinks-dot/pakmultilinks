"use client";

import { useState } from "react";
import styles from "./blog.module.css";

export function CartonCalculator() {
  const [price, setPrice] = useState("4800");
  const [units, setUnits] = useState("24");
  const [cartons, setCartons] = useState("1");
  const [delivery, setDelivery] = useState("0");
  const values = [price, units, cartons, delivery].map(Number);
  const valid =
    [price, units, cartons, delivery].every((value) => value.trim() !== "") &&
    values.every(Number.isFinite) &&
    values[0] >= 0 &&
    values[3] >= 0 &&
    Number.isInteger(values[1]) &&
    values[1] > 0 &&
    Number.isInteger(values[2]) &&
    values[2] > 0;
  const total = values[0] * values[2] + values[3];
  const currency = (value: number) =>
    new Intl.NumberFormat("en-PK", {
      style: "currency",
      currency: "PKR",
      maximumFractionDigits: 2,
    }).format(value);
  return (
    <section className={styles.calculator} aria-labelledby="calculator-heading">
      <p className={styles.eyebrow}>Try your own numbers</p>
      <h2 id="calculator-heading">Carton cost calculator</h2>
      <p>
        Illustrative values only. Enter your quoted price and include any
        applicable charges in the delivery / other charges field.
      </p>
      <div className={styles.calculatorInputs}>
        {[
          {
            label: "Price per carton (PKR)",
            value: price,
            set: setPrice,
            min: 0,
            step: "0.01",
          },
          {
            label: "Units per carton",
            value: units,
            set: setUnits,
            min: 1,
            step: "1",
          },
          {
            label: "Number of cartons",
            value: cartons,
            set: setCartons,
            min: 1,
            step: "1",
          },
          {
            label: "Delivery / other charges (PKR)",
            value: delivery,
            set: setDelivery,
            min: 0,
            step: "0.01",
          },
        ].map((field) => (
          <label key={field.label}>
            {field.label}
            <input
              type="number"
              inputMode={field.step === "1" ? "numeric" : "decimal"}
              min={field.min}
              step={field.step}
              value={field.value}
              onChange={(event) => field.set(event.target.value)}
            />
          </label>
        ))}
      </div>
      <div role="status" aria-live="polite" className={styles.calculatorResult}>
        {valid && Number.isFinite(total) ? (
          <>
            <span>
              Delivered total<strong>{currency(total)}</strong>
            </span>
            <span>
              Cost per unit
              <strong>{currency(total / (values[1] * values[2]))}</strong>
            </span>
          </>
        ) : (
          <p>
            Enter non-negative prices and positive whole numbers for units and
            cartons.
          </p>
        )}
      </div>
    </section>
  );
}
