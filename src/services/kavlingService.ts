import { proadsApi, KavlingItem, KavlingListResponse, KavlingProgresResponse, SubkontraktorItem, FilterItem, KavlingFilterParams } from '../utils/apiHelper';

export type { KavlingItem, ProgresItem, SubkontraktorItem, FilterItem, DeadlineStatus } from '../utils/apiHelper';

// ✅ Tambah marketing_id di filter params
export interface KavlingServiceFilters extends KavlingFilterParams {
  marketing_id?: number;
}

class KavlingService {

  // ── List Kavling ────────────────────────────────────────
  async getKavlingList(filters?: KavlingServiceFilters): Promise<{
    data: KavlingItem[];
    meta: {
      current_page: number;
      last_page: number;
      per_page: number;
      total: number;
    };
  }> {
    const response = await proadsApi.getKavlingList(filters);

    if (response.success) {
      return {
        data: response.data,
        meta: response.meta,
      };
    }

    throw new Error('Gagal mengambil data kavling');
  }

  // ── Detail Kavling ──────────────────────────────────────
  async getKavlingById(id: number): Promise<KavlingItem> {
    const response = await proadsApi.getKavlingDetail(id);

    if (response.success && response.data) {
      return response.data;
    }

    throw new Error('Kavling tidak ditemukan');
  }

  // ── Progres Kavling ─────────────────────────────────────
  async getKavlingProgres(id: number): Promise<KavlingProgresResponse['data']> {
    const response = await proadsApi.getKavlingProgres(id);

    if (response.success && response.data) {
      return response.data;
    }

    throw new Error('Gagal mengambil data progres');
  }

  // ── Subkontraktor Kavling ───────────────────────────────
  async getKavlingSubkontraktor(id: number): Promise<SubkontraktorItem[]> {
    const response = await proadsApi.getKavlingSubkontraktor(id);

    if (response.success) {
      return response.data;
    }

    throw new Error('Gagal mengambil data subkontraktor');
  }

  // ── Filter Options — filter by marketing_id ─────────────
  async getProjects(marketingId?: number): Promise<FilterItem[]> {
    const response = await proadsApi.getFilterProject(marketingId);

    if (response.success) {
      return response.data;
    }

    throw new Error('Gagal mengambil data project');
  }

  async getClusters(idProject?: number): Promise<FilterItem[]> {
    const response = await proadsApi.getFilterCluster(idProject);

    if (response.success) {
      return response.data;
    }

    throw new Error('Gagal mengambil data cluster');
  }

  async getBloks(idCluster?: number): Promise<FilterItem[]> {
    const response = await proadsApi.getFilterBlok(idCluster);

    if (response.success) {
      return response.data;
    }

    throw new Error('Gagal mengambil data blok');
  }
}

export const kavlingService = new KavlingService();
export default kavlingService;