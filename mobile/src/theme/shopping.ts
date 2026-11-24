export const colors = {
  primary: "#6030FF",
  primarySoft: "#F0EAFF",
  ink: "#111A3B",
  muted: "#76819A",
  background: "#FAF9FF",
  surface: "#FFFFFF",
  border: "#E7E8F1",
  success: "#168466",
  danger: "#C33852",
};
export const money = (value: number) =>
  new Intl.NumberFormat("es-CL", {
    style: "currency",
    currency: "CLP",
    maximumFractionDigits: 0,
  }).format(value);
