-- CreateTable
CREATE TABLE "categories" (
    "id" SERIAL NOT NULL,
    "name" VARCHAR(200) NOT NULL,

    CONSTRAINT "categories_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "employees" (
    "id" SERIAL NOT NULL,
    "email" VARCHAR(255) NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "employee_code" VARCHAR(100),
    "designation" VARCHAR(255),
    "division" VARCHAR(255),
    "joining_date" VARCHAR(50),
    "feedback_source" VARCHAR(255) DEFAULT 'Voice Box',

    CONSTRAINT "employees_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "feedback" (
    "id" SERIAL NOT NULL,
    "category" VARCHAR(200) NOT NULL,
    "text" TEXT NOT NULL,
    "is_anonymous" BOOLEAN NOT NULL DEFAULT true,
    "employee_id" INTEGER,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "feedback_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "fms_integration_outbox" (
    "id" SERIAL NOT NULL,
    "feedback_id" INTEGER NOT NULL,
    "status" VARCHAR(50) NOT NULL,
    "fms_ticket_id" VARCHAR(100),
    "retry_count" INTEGER NOT NULL DEFAULT 0,
    "error_message" TEXT,
    "last_attempt_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "fms_integration_outbox_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "categories_name_key" ON "categories"("name");

-- CreateIndex
CREATE UNIQUE INDEX "employees_email_key" ON "employees"("email");

-- AddForeignKey
ALTER TABLE "feedback" ADD CONSTRAINT "feedback_employee_id_fkey" FOREIGN KEY ("employee_id") REFERENCES "employees"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "fms_integration_outbox" ADD CONSTRAINT "fms_integration_outbox_feedback_id_fkey" FOREIGN KEY ("feedback_id") REFERENCES "feedback"("id") ON DELETE CASCADE ON UPDATE CASCADE;
