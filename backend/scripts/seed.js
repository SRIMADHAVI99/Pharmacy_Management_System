const bcrypt = require('bcrypt');
const pool = require('../config/db');

async function seed() {
    try {
        console.log('Starting database seeding...');
        
        // 1. Users
        const passwordHash = await bcrypt.hash('admin123', 10);
        await pool.query(`INSERT IGNORE INTO users (username, password_hash, role) VALUES 
            ('admin', ?, 'Admin'),
            ('pharmacist', ?, 'Pharmacist'),
            ('staff', ?, 'Staff')`, 
            [passwordHash, passwordHash, passwordHash]
        );
        console.log('Users seeded.');

        // 2. Suppliers
        await pool.query(`INSERT IGNORE INTO suppliers (name, contact_person, phone, email, address, gst_number) VALUES 
            ('PharmaCorp', 'Rahul Sharma', '9876543210', 'rahul@pharmacorp.com', '123 Pharma St, Mumbai', '27AABCU9603R1ZN'),
            ('HealthMeds', 'Priya Singh', '9876543211', 'priya@healthmeds.com', '456 Health Ave, Delhi', '07AABCH1234R1ZN'),
            ('CureAll', 'Amit Patel', '9876543212', 'amit@cureall.com', '789 Cure Rd, Ahmedabad', '24AABCC5678R1ZN'),
            ('LifeCare', 'Sneha Gupta', '9876543213', 'sneha@lifecare.com', '101 Life Ln, Bangalore', '29AABCL9012R1ZN'),
            ('MediSupply', 'Vikram Reddy', '9876543214', 'vikram@medisupply.com', '202 Medi Blvd, Hyderabad', '36AABCM3456R1ZN')
        `);
        console.log('Suppliers seeded.');

        // 3. Customers
        await pool.query(`INSERT IGNORE INTO customers (name, phone, email, dob, address, medical_notes) VALUES 
            ('Ramesh Kumar', '9123456780', 'ramesh@email.com', '1980-05-15', 'Flat 1, Building A, Mumbai', 'Allergic to Penicillin'),
            ('Sita Devi', '9123456781', 'sita@email.com', '1975-10-20', 'House 2, Lane B, Delhi', 'Diabetic'),
            ('Ravi Shankar', '9123456782', 'ravi@email.com', '1990-03-25', 'Apt 3, Tower C, Ahmedabad', 'None'),
            ('Geeta Patel', '9123456783', 'geeta@email.com', '1985-08-30', 'Villa 4, Street D, Bangalore', 'Asthma'),
            ('Suresh Nair', '9123456784', 'suresh@email.com', '1970-12-05', 'Plot 5, Avenue E, Chennai', 'Hypertension'),
            ('Lakshmi Iyer', '9123456785', 'lakshmi@email.com', '1995-02-10', 'Block 6, Road F, Hyderabad', 'None'),
            ('Gopal Krishnan', '9123456786', 'gopal@email.com', '1982-07-15', 'House 7, Lane G, Kolkata', 'None'),
            ('Meera Rajput', '9123456787', 'meera@email.com', '1992-11-20', 'Flat 8, Building H, Pune', 'None'),
            ('Arjun Singh', '9123456788', 'arjun@email.com', '1988-04-25', 'Apt 9, Tower I, Jaipur', 'None'),
            ('Kavita Joshi', '9123456789', 'kavita@email.com', '1978-09-30', 'Villa 10, Street J, Lucknow', 'None')
        `);
        console.log('Customers seeded.');

        // 4. Medicines
        await pool.query(`INSERT IGNORE INTO medicines (name, generic_name, category, manufacturer, batch_number, dosage, form, purchase_price, selling_price, quantity, min_stock, expiry_date, requires_prescription, supplier_id) VALUES 
            ('Paracetamol 500mg', 'Paracetamol', 'Analgesic', 'PharmaCorp', 'BATCH001', '500mg', 'Tablet', 10.00, 15.00, 1000, 100, '2027-12-31', FALSE, 1),
            ('Amoxicillin 250mg', 'Amoxicillin', 'Antibiotic', 'HealthMeds', 'BATCH002', '250mg', 'Capsule', 20.00, 30.00, 500, 50, '2026-06-30', TRUE, 2),
            ('Cetirizine 10mg', 'Cetirizine', 'Antihistamine', 'CureAll', 'BATCH003', '10mg', 'Tablet', 5.00, 8.00, 800, 100, '2028-01-15', FALSE, 3),
            ('Omeprazole 20mg', 'Omeprazole', 'Antacid', 'LifeCare', 'BATCH004', '20mg', 'Capsule', 15.00, 25.00, 600, 60, '2026-11-30', FALSE, 4),
            ('Metformin 500mg', 'Metformin', 'Antidiabetic', 'MediSupply', 'BATCH005', '500mg', 'Tablet', 12.00, 18.00, 700, 70, '2027-05-31', TRUE, 5),
            ('Ibuprofen 400mg', 'Ibuprofen', 'Analgesic', 'PharmaCorp', 'BATCH006', '400mg', 'Tablet', 8.00, 12.00, 900, 90, '2026-08-31', FALSE, 1),
            ('Azithromycin 500mg', 'Azithromycin', 'Antibiotic', 'HealthMeds', 'BATCH007', '500mg', 'Tablet', 25.00, 35.00, 400, 40, '2026-04-30', TRUE, 2),
            ('Loratadine 10mg', 'Loratadine', 'Antihistamine', 'CureAll', 'BATCH008', '10mg', 'Tablet', 6.00, 10.00, 750, 75, '2027-10-31', FALSE, 3),
            ('Pantoprazole 40mg', 'Pantoprazole', 'Antacid', 'LifeCare', 'BATCH009', '40mg', 'Tablet', 18.00, 28.00, 550, 55, '2026-12-31', FALSE, 4),
            ('Glimepiride 1mg', 'Glimepiride', 'Antidiabetic', 'MediSupply', 'BATCH010', '1mg', 'Tablet', 10.00, 15.00, 650, 65, '2027-07-31', TRUE, 5),
            ('Aspirin 75mg', 'Aspirin', 'Analgesic', 'PharmaCorp', 'BATCH011', '75mg', 'Tablet', 5.00, 8.00, 1200, 120, '2028-03-31', FALSE, 1),
            ('Ciprofloxacin 500mg', 'Ciprofloxacin', 'Antibiotic', 'HealthMeds', 'BATCH012', '500mg', 'Tablet', 22.00, 32.00, 450, 45, '2026-05-31', TRUE, 2),
            ('Fexofenadine 120mg', 'Fexofenadine', 'Antihistamine', 'CureAll', 'BATCH013', '120mg', 'Tablet', 12.00, 18.00, 600, 60, '2027-08-31', FALSE, 3),
            ('Rabeprazole 20mg', 'Rabeprazole', 'Antacid', 'LifeCare', 'BATCH014', '20mg', 'Tablet', 16.00, 26.00, 500, 50, '2026-10-31', FALSE, 4),
            ('Pioglitazone 15mg', 'Pioglitazone', 'Antidiabetic', 'MediSupply', 'BATCH015', '15mg', 'Tablet', 14.00, 22.00, 550, 55, '2027-09-30', TRUE, 5),
            ('Diclofenac 50mg', 'Diclofenac', 'Analgesic', 'PharmaCorp', 'BATCH016', '50mg', 'Tablet', 7.00, 11.00, 850, 85, '2026-07-31', TRUE, 1),
            ('Levofloxacin 500mg', 'Levofloxacin', 'Antibiotic', 'HealthMeds', 'BATCH017', '500mg', 'Tablet', 28.00, 40.00, 350, 35, '2026-03-31', TRUE, 2),
            ('Levocetirizine 5mg', 'Levocetirizine', 'Antihistamine', 'CureAll', 'BATCH018', '5mg', 'Tablet', 8.00, 12.00, 700, 70, '2027-11-30', FALSE, 3),
            ('Esomeprazole 40mg', 'Esomeprazole', 'Antacid', 'LifeCare', 'BATCH019', '40mg', 'Tablet', 20.00, 30.00, 450, 45, '2026-09-30', FALSE, 4),
            ('Sitagliptin 50mg', 'Sitagliptin', 'Antidiabetic', 'MediSupply', 'BATCH020', '50mg', 'Tablet', 30.00, 45.00, 400, 40, '2027-12-31', TRUE, 5)
        `);
        console.log('Medicines seeded.');

        console.log('Seeding completed successfully!');
        process.exit(0);
    } catch (error) {
        console.error('Error seeding database:', error);
        process.exit(1);
    }
}

seed();
