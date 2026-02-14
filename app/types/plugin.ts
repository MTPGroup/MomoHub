export interface PluginSchemaResponse {
  name: string;
  description: string;
  parameters: Record<string, unknown>;
}

export interface PluginSchemaDto {
  name: string;
  description: string;
  parameters: Record<string, unknown>;
}

export interface PluginResponse {
  id: string;
  name: string;
  description: string;
  version: string;
  schema: PluginSchemaResponse;
  authorId: string;
  status: string;
  likeCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface PluginDetailResponse {
  id: string;
  name: string;
  description: string;
  version: string;
  schema: PluginSchemaResponse;
  code: string;
  authorId: string;
  status: string;
  likeCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface PagedPluginResponse {
  items: PluginResponse[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasNext: boolean;
  hasPrevious: boolean;
}

export interface CreatePluginRequest {
  name: string;
  description: string;
  version: string;
  schema: PluginSchemaDto;
  code: string;
}

export interface UpdatePluginRequest {
  name: string;
  description: string;
  version: string;
  schema: PluginSchemaDto;
  code: string;
}
