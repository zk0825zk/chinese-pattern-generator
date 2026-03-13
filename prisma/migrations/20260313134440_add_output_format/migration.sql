-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Pattern" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "name" TEXT NOT NULL DEFAULT '未命名纹样',
    "type" TEXT NOT NULL,
    "params" TEXT NOT NULL,
    "svg" TEXT NOT NULL,
    "thumbnail" TEXT,
    "outputFormat" TEXT NOT NULL DEFAULT 'svg',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Pattern_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_Pattern" ("createdAt", "id", "name", "params", "svg", "thumbnail", "type", "updatedAt", "userId") SELECT "createdAt", "id", "name", "params", "svg", "thumbnail", "type", "updatedAt", "userId" FROM "Pattern";
DROP TABLE "Pattern";
ALTER TABLE "new_Pattern" RENAME TO "Pattern";
CREATE INDEX "Pattern_userId_createdAt_idx" ON "Pattern"("userId", "createdAt");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
