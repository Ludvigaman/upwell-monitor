export class AuthorizedCharacterData {
    characterID: number;
    characterName: string;
    expiresOn: Date;
    scopes: string;
    tokenType: string;
    characterOwnerHash: string;

    token: string;
    refreshToken: string;
    allianceID: number;
    corporationID: number;
    factionID: number;
}