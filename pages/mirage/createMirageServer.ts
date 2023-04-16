import { createServer } from "miragejs";

export default function createMirageServer() {
  createServer({
    routes() {
      this.get("/api/validate/clippings", () => ({
        data: true,
      }));

      this.get(
        "https://www.googleapis.com/books/v1/volumes?q=intitle:title",
        () => ({})
      );
    },
  });
}
