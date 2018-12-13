export class ApiResponse {
    data: any;
    error: any;

    constructor(json: any) {
        if (json != null) {
            this.data = json['data'];
            this.error = json['error'];
        }
    }
}
