declare namespace Express {
    export interface Request {
        customer: {
            id: string;
            cpf: string;
            name: string;
            statement: [];
        };
    }
}