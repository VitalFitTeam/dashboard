export const mapSimpleToChart = (apiData: { label: string; value: string }[]) => {
  return apiData.map((item) => ({
    name: item.label,
    valor: parseFloat(item.value), 
  }));
};