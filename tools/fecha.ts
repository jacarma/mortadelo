export default {
  name: "fecha",
  description: "devuelve la fecha y hora actual",
  execute: async () => {
    const d = new Date();
    return `${d.getFullYear()}-${d.getMonth()}-${d.getDate()} ${d.getHours()}:${d.getMinutes()}`;
  },
};
