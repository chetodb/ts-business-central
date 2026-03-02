import { BcFilter, BusinessCentralClient, } from '../packages/core/src/index.js';
/**
 * PLAYGROUND - Test script to validate the SDK
 *
 * Run:
 * pnpm playground or pnpm playground:watch (for auto-reload)
 */
async function main() {
    const environment = 'Sandbox';
    const tenantId = 'dummy-tenant-id';
    const companyName = 'dummy-company';
    const azureKeys = [
        {
            name: 'POL-KEY-01',
            clientId: 'dummy-client-id-1',
            clientSecret: 'dummy-client-secret-1',
        },
        {
            name: 'POL-KEY-02',
            clientId: 'dummy-client-id-2',
            clientSecret: 'dummy-client-secret-2',
        },
    ];
    if (!tenantId || azureKeys.length === 0) {
        console.error('Error: Missing Tenant ID or Azure Keys. Please complete the configuration before running the playground.');
        return;
    }
    console.log(`Starting Playground for environment: ${environment}`);
    // 1. Initialize the Business Central Client
    const client = new BusinessCentralClient({
        environment,
        tenantId,
        companyName,
        azureKeys,
    });
    try {
        //=================================================================
        // Get
        console.log('[1/6] GET Request');
        const filter = new BcFilter().eq('Item_No', 'item-001');
        const items = await client.get('item', { filter: filter, top: 5 });
        console.log(` - Items found: ${items?.length || 0}`);
        if (items && items.length > 0) {
            console.log(' - First item:');
            console.log(items[0]);
        }
        //=================================================================
        // Post
        // console.log('[2/6] POST Request (Create)');
        // const newItem = { Item_No: 'item-001', Description: 'SDK-TEST' };
        // const created = await client.post('item', newItem);
        //=================================================================
        // Patch
        // console.log('[3/6] PATCH Request (Update)');
        // const patchCriteria = { Item_No: 'item-001', Description: 'SDK-TEST' };
        // const newData = { Description: 'Updated via SDK' };
        // await client.patch('item', patchCriteria, newData);
        //=================================================================
        // Put
        // console.log('[4/6] PUT Request (Update)');
        // const patchCriteria = { Item_No: 'item-001', Description: 'SDK-TEST' };
        // const newData = { Description: 'Updated via SDK' };
        // await client.put('item', patchCriteria, newData);
        //=================================================================
        // Delete
        // console.log('[5/6] DELETE Request');
        // const deleteCriteria = { Item_No: 'item-001', Description: 'SDK-TEST' };
        // await client.delete('item', deleteCriteria);
        //=================================================================
        // Execute Action
        // console.log('[6/6] EXECUTE ACTION');
        // await client.executeAction('', { documentNo: '123' });
    }
    catch (error) {
        console.error('Error in playground:', error);
    }
}
main().catch(console.error);
//# sourceMappingURL=index.js.map