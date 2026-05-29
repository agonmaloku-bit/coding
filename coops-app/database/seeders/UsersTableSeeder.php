<?php

namespace Database\Seeders;

use App\Enums\Roles;
use App\Logic\Departments;
use App\Models\Department;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Schema;

class UsersTableSeeder extends Seeder
{
    /**
     * Run the database seeds.
     *
     * @return void
     */
    public function run()
    {
        Schema::disableForeignKeyConstraints();
        User::truncate();
        Schema::enableForeignKeyConstraints();

        $password = "Password1.";

        // Superadmin
        User::create([
            'first_name' => 'Super',
            'last_name' => 'Admin',
            'email' => 'admin@gmail.com',
            'password' => $password,
            'email_verified_at' => now(),
            'department_id' => '1'
        ])->assignRole(replace_whites(Roles::SUPER_ADMIN));

        User::create([
            'first_name' => 'Admin',
            'last_name' => 'Admin',
            'email' => 'admin1@gmail.com',
            'password' => $password,
            'email_verified_at' => now(),
            'department_id' => '1'
        ])->assignRole(replace_whites(Roles::ADMIN));

        $departments = Department::all();

        $i = 0;
        foreach ($departments as $dep) {
            $i = $i+1;
            User::create([
                'first_name' => 'Personi',
                'last_name' => $i,
                'email' => "personi{$i}@gmail.com",
                'password' => $password,
                'email_verified_at' => now(),
                'department_id' => $dep->id,
            ])->assignRole(replace_whites(Roles::RESPONSIBLE_PERSON));

            User::create([
                'first_name' => 'Zyrtar',
                'last_name' => 'Prokurimit ' . $i,
                'email' => "zyrtar_prokurimit{$i}@gmail.com",
                'password' => $password,
                'email_verified_at' => now(),
                'department_id' => $dep->id,
            ])->assignRole(replace_whites(Roles::PROCUREMENT_OFFICER));

            User::create([
                'first_name' => 'Drejtor',
                'last_name' => 'Departamentit' . $i,
                'email' => "drejtor_departamentit{$i}@gmail.com",
                'password' => $password,
                'email_verified_at' => now(),
                'department_id' => $dep->id,
            ])->assignRole(replace_whites(Roles::DIRECTOR_DEPARTMENT));
        }

        User::create([
            'first_name' => 'Drejtor',
            'last_name' => 'Ekzekuiv',
            'email' => "drejtor_ekzekutiv@gmail.com",
            'password' => $password,
            'email_verified_at' => now(),
            'department_id' =>  '1',
        ])->assignRole(replace_whites(Roles::EXECUTIVE_DIRECTOR));

        User::create([
            'first_name' => 'Zyra',
            'last_name' => 'Ligjore 1',
            'email' => "zyra_ligjore@gmail.com",
            'password' => $password,
            'email_verified_at' => now(),
            'department_id' => '1',
        ])->assignRole(replace_whites(Roles::LEGAL_OFFICE));


        $dep = Department::where("name", "HR")->first();

        User::create([
            "first_name" => "Dorentina",
            "last_name" => "Batusha",
            "email" => "dorentina@bbros.eu",
            'password' => "Bbros1234.",
            'email_verified_at' => now(),
            'department_id' => $dep->id,
        ])->assignRole(replace_whites(Roles::RESPONSIBLE_PERSON));

        User::create([
            "first_name" => "Zani",
            "last_name" => "Rexha",
            "email" => "zani@bbros.eu",
            'password' => "Bbros1234.",
            'email_verified_at' => now(),
            'department_id' => $dep->id,
        ])->assignRole(replace_whites(Roles::PROCUREMENT_OFFICER));


        User::create([
            "first_name" => "Edmond",
            "last_name" => "Hashani",
            "email" => "edmond@bbros.eu",
            'password' => "Bbros1234.",
            'email_verified_at' => now(),
            'department_id' => $dep->id,
        ])->assignRole(replace_whites(Roles::DIRECTOR_DEPARTMENT));


        User::create([
            "first_name" => "Idea",
            "last_name" => "Kepuska",
            "email" => "idea@bbros.eu",
            'password' => "Bbros1234.",
            'email_verified_at' => now(),
            'department_id' => $dep->id,
        ])->assignRole(replace_whites(Roles::EXECUTIVE_DIRECTOR));

        User::create([
            "first_name" => "Nina",
            "last_name" => "Kelmendi",
            "email" => "nina@bbros.eu",
            'password' => "Bbros1234.",
            'email_verified_at' => now(),
            'department_id' => $dep->id,
        ])->assignRole(replace_whites(Roles::LEGAL_OFFICE));
    }
}
