import { MongoClient } from "mongodb";
import dns from "dns";

// Ensure Node.js DNS resolver falls back to public DNS servers (8.8.8.8, 1.1.1.1)
// if local ISP/Windows DNS fails SRV lookup for MongoDB Atlas (_mongodb._tcp)
try {
  dns.setServers(["8.8.8.8", "1.1.1.1", "8.8.4.4"]);
} catch (e) {
  // Ignore in environments where setServers is restricted
}

let uri = process.env.MONGODB_URI;

// Bypass Next.js API Route SRV lookup failures by translating to direct replica set hosts
if (uri && uri.includes("mongodb+srv://") && uri.includes("cluster1.kg3dyfq.mongodb.net")) {
  uri = uri.replace(
    "mongodb+srv://AnshSinha:Ansh86044@cluster1.kg3dyfq.mongodb.net",
    "mongodb://AnshSinha:Ansh86044@ac-awgz28o-shard-00-00.kg3dyfq.mongodb.net:27017,ac-awgz28o-shard-00-01.kg3dyfq.mongodb.net:27017,ac-awgz28o-shard-00-02.kg3dyfq.mongodb.net:27017"
  );
  if (uri.includes("?")) {
    uri = uri.replace("retryWrites=true", "retryWrites=true&replicaSet=atlas-118049-shard-0&ssl=true&authSource=admin");
  } else {
    uri += "?replicaSet=atlas-118049-shard-0&ssl=true&authSource=admin";
  }
}

const options = {};

let client: MongoClient;
let clientPromise: Promise<MongoClient>;

if (uri) {
  if (process.env.NODE_ENV === "development") {
    // In development mode, use a global variable so that the value
    // is preserved across module reloads caused by HMR (Hot Module Replacement).
    const globalWithMongo = global as typeof globalThis & {
      _mongoClientPromise?: Promise<MongoClient>;
    };

    // Force invalidation of old cached MongoClient that had the SRV lookup bug
    delete globalWithMongo._mongoClientPromise;

    if (!globalWithMongo._mongoClientPromise) {
      client = new MongoClient(uri, options);
      globalWithMongo._mongoClientPromise = client.connect();
    }
    clientPromise = globalWithMongo._mongoClientPromise;
  } else {
    // In production mode, it's best to not use a global variable.
    client = new MongoClient(uri, options);
    clientPromise = client.connect();
  }
} else {
  // Graceful fallback for build-time compilation to prevent Vercel build failures.
  // It will only throw an error at runtime if the DB is actually queried.
  clientPromise = Promise.reject(new Error('Invalid/Missing environment variable: "MONGODB_URI"'));
}

// Export a module-scoped MongoClient promise. By doing this in a
// separate module, the client can be shared across functions.
export default clientPromise;
