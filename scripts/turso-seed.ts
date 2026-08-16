import { createClient } from '@libsql/client';

const TURSO_URL = process.env.TURSO_DATABASE_URL!;
const TURSO_TOKEN = process.env.TURSO_AUTH_TOKEN!;

async function main() {
  const client = createClient({ url: TURSO_URL, authToken: TURSO_TOKEN });

  try {
    // Check if admin user already exists
    const existingUsers = await client.execute("SELECT COUNT(*) as cnt FROM User WHERE email = 'admin@asrgroup.com'");
    if (Number(existingUsers.rows[0].cnt) > 0) {
      console.log("⏭️ Admin user already exists, skipping seed");
    } else {
      // Seed admin user
      await client.execute(
        `INSERT INTO User (id, name, email, password, phone, employeeId, department, branch, role, status) VALUES (
          'clx_admin_001',
          'Admin',
          'admin@asrgroup.com',
          '123456',
          '',
          '',
          '',
          '',
          'Admin',
          'Active'
        )`
      );
      console.log("✅ Admin user seeded (admin@asrgroup.com / 123456)");
    }

    // Seed dropdown options
    const existingOptions = await client.execute("SELECT COUNT(*) as cnt FROM DropdownOption");
    if (Number(existingOptions.rows[0].cnt) > 0) {
      console.log("⏭️ Dropdown options already exist, skipping seed");
    } else {
      const dropdownOptions = [
        // Departments
        { type: 'department', value: 'IT' },
        { type: 'department', value: 'HR' },
        { type: 'department', value: 'Finance' },
        { type: 'department', value: 'Operations' },
        { type: 'department', value: 'Marketing' },
        { type: 'department', value: 'Sales' },
        { type: 'department', value: 'Procurement' },
        { type: 'department', value: 'Engineering' },
        { type: 'department', value: 'Quality Assurance' },
        // Branches
        { type: 'branch', value: 'Dhaka HQ' },
        { type: 'branch', value: 'Chittagong' },
        { type: 'branch', value: 'Sylhet' },
        { type: 'branch', value: 'Rajshahi' },
        { type: 'branch', value: 'Khulna' },
        { type: 'branch', value: 'Barishal' },
        { type: 'branch', value: 'Rangpur' },
        { type: 'branch', value: 'Mymensingh' },
        // Addresses
        { type: 'address', value: 'Gulshan, Dhaka' },
        { type: 'address', value: 'Dhanmondi, Dhaka' },
        { type: 'address', value: 'Motijheel, Dhaka' },
        { type: 'address', value: 'Agrabad, Chittagong' },
        { type: 'address', value: 'Ambarkhana, Sylhet' },
        { type: 'address', value: 'Saheb Bazar, Rajshahi' },
        { type: 'address', value: 'Sonadanga, Khulna' },
        { type: 'address', value: 'Kauniya, Barishal' },
        { type: 'address', value: 'Tower Para, Rangpur' },
      ];

      for (let i = 0; i < dropdownOptions.length; i++) {
        const opt = dropdownOptions[i];
        const id = `clx_opt_${String(i + 1).padStart(3, '0')}`;
        await client.execute(
          `INSERT INTO DropdownOption (id, type, value) VALUES ('${id}', '${opt.type}', '${opt.value}')`
        );
      }
      console.log(`✅ ${dropdownOptions.length} dropdown options seeded`);
    }

    // Verify counts
    const userCount = await client.execute("SELECT COUNT(*) as cnt FROM User");
    const optCount = await client.execute("SELECT COUNT(*) as cnt FROM DropdownOption");
    const reqCount = await client.execute("SELECT COUNT(*) as cnt FROM Requisition");
    console.log(`\n📊 Database Summary:`);
    console.log(`   Users: ${userCount.rows[0].cnt}`);
    console.log(`   Dropdown Options: ${optCount.rows[0].cnt}`);
    console.log(`   Requisitions: ${reqCount.rows[0].cnt}`);

  } catch (error) {
    console.error("❌ Seed failed:", error);
    process.exit(1);
  } finally {
    await client.close();
  }
}

main();
