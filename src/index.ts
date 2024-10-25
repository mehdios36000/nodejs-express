import http from "http";
import app  from "@config/server";

const httpServer = http.createServer(app);

httpServer.listen(process.env.PORT || 3000, async () => {
  console.log(`The server is running on port ${process.env.PORT}`);
});
