/**
 * Dropbox integration helpers.
 *
 * These are placeholder implementations. To enable real Dropbox
 * integration, register an app on the Dropbox Developer portal,
 * configure OAuth 2.0, and install the `dropbox` SDK.
 */

export function getDropboxAuthUrl(): string {
  // Placeholder - replace with real Dropbox OAuth URL generation.
  //
  // Example:
  //   const dbx = new Dropbox({ clientId: APP_KEY });
  //   return dbx.auth.getAuthenticationUrl(REDIRECT_URI);

  return "https://www.dropbox.com/oauth2/authorize?placeholder=true";
}

export async function handleDropboxCallback(
  code: string
): Promise<{ access_token: string }> {
  // Placeholder - exchange auth code for tokens.
  //
  // Example:
  //   const response = await dbx.auth.getAccessTokenFromCode(REDIRECT_URI, code);
  //   return response.result;

  console.log("Dropbox callback received code:", code);
  return {
    access_token: "placeholder_access_token",
  };
}

export async function syncDropbox(
  userId: string
): Promise<{ synced: number; message: string }> {
  // Placeholder - sync files from Dropbox to local documents.
  //
  // Example:
  //   const dbx = new Dropbox({ accessToken });
  //   const files = await dbx.filesListFolder({ path: "" });
  //   // Insert each file as a document record

  console.log("Syncing Dropbox for user:", userId);
  return {
    synced: 0,
    message: "Dropbox sync placeholder - connect Dropbox SDK",
  };
}
