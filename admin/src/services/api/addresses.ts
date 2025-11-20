import { apiService } from './base';
import type {
  Address,
  AddressCreate,
  AddressUpdate,
  AddressFilters,
  AddressListResponse,
  AddressStatistics,
  AddressVerify,
  AddressVerificationResponse,
  SetDefaultRequest,
  AddressBulkImport,
  AddressBulkImportResult,
  PaginationParams,
} from '../../types/api.types';

/**
 * Address Management Service
 * Handles all address-related API operations including CRUD,
 * verification, bulk import, and statistics
 */
export class AddressesService {
  private readonly basePath = '/api/admin/v1/business-operations/addresses';

  // ===== CRUD OPERATIONS =====

  /**
   * Create a new address
   */
  async createAddress(data: AddressCreate): Promise<Address> {
    return apiService.post<Address>(this.basePath, data);
  }

  /**
   * Get paginated list of addresses with filters
   */
  async getAddresses(
    filters?: AddressFilters,
    pagination?: PaginationParams
  ): Promise<AddressListResponse> {
    const params = {
      ...filters,
      page: pagination?.page || 1,
      page_size: pagination?.page_size || 20,
    };
    return apiService.get<AddressListResponse>(this.basePath, { params });
  }

  /**
   * Get address details by ID
   */
  async getAddress(addressId: string): Promise<Address> {
    return apiService.get<Address>(`${this.basePath}/${addressId}`);
  }

  /**
   * Update an address
   */
  async updateAddress(addressId: string, data: AddressUpdate): Promise<Address> {
    return apiService.put<Address>(`${this.basePath}/${addressId}`, data);
  }

  /**
   * Delete an address
   */
  async deleteAddress(addressId: string): Promise<{ address_id: string; deleted: boolean }> {
    return apiService.delete<{ address_id: string; deleted: boolean }>(
      `${this.basePath}/${addressId}`
    );
  }

  // ===== ADDRESS ACTIONS =====

  /**
   * Get all addresses for a specific user
   */
  async getUserAddresses(
    userId: string,
    ownerType: 'admin' | 'provider' | 'customer'
  ): Promise<Address[]> {
    return apiService.get<Address[]>(`${this.basePath}/users/${userId}`, {
      params: { owner_type: ownerType },
    });
  }

  /**
   * Set an address as default for a user
   */
  async setDefaultAddress(addressId: string, data: SetDefaultRequest): Promise<Address> {
    return apiService.patch<Address>(`${this.basePath}/${addressId}/set-default`, data);
  }

  /**
   * Verify address with geocoding/location services
   */
  async verifyAddress(
    addressId: string,
    data: AddressVerify
  ): Promise<AddressVerificationResponse> {
    return apiService.post<AddressVerificationResponse>(
      `${this.basePath}/${addressId}/verify`,
      data
    );
  }

  /**
   * Bulk import multiple addresses (max 100 per request)
   */
  async bulkImportAddresses(data: AddressBulkImport): Promise<AddressBulkImportResult> {
    return apiService.post<AddressBulkImportResult>(`${this.basePath}/bulk-import`, data);
  }

  // ===== STATISTICS =====

  /**
   * Get address statistics and analytics
   */
  async getStatistics(): Promise<AddressStatistics> {
    return apiService.get<AddressStatistics>(`${this.basePath}/statistics/overview`);
  }

  // ===== SEARCH & FILTER HELPERS =====

  /**
   * Search addresses by text query
   */
  async searchAddresses(
    searchQuery: string,
    pagination?: PaginationParams
  ): Promise<AddressListResponse> {
    return this.getAddresses({ search: searchQuery }, pagination);
  }

  /**
   * Get addresses by city
   */
  async getAddressesByCity(city: string, pagination?: PaginationParams): Promise<AddressListResponse> {
    return this.getAddresses({ city }, pagination);
  }

  /**
   * Get addresses by state
   */
  async getAddressesByState(state: string, pagination?: PaginationParams): Promise<AddressListResponse> {
    return this.getAddresses({ state }, pagination);
  }

  /**
   * Get verified addresses only
   */
  async getVerifiedAddresses(pagination?: PaginationParams): Promise<AddressListResponse> {
    return this.getAddresses({ is_verified: true }, pagination);
  }

  /**
   * Get unverified addresses only
   */
  async getUnverifiedAddresses(pagination?: PaginationParams): Promise<AddressListResponse> {
    return this.getAddresses({ is_verified: false }, pagination);
  }
}

// Export singleton instance
export const addressesService = new AddressesService();
