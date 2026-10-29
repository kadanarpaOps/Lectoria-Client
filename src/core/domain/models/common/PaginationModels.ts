interface MetaModel {
    numberPage: number;
    pageSize: number;
    totalItems: number;
    totalPages: number;
}

export interface PageResponse<T> {
    data: T[];
    meta: MetaModel;
}