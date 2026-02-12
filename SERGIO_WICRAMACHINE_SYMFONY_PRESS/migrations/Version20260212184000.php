<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

final class Version20260212184000 extends AbstractMigration
{
    public function getDescription(): string
    {
        return 'Make author_id nullable for data import';
    }

    public function up(Schema $schema): void
    {
        $this->addSql('ALTER TABLE article MODIFY author_id INT NULL');
    }

    public function down(Schema $schema): void
    {
        $this->addSql('ALTER TABLE article MODIFY author_id INT NOT NULL');
    }
}
