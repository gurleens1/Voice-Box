export async function sendAnonymousAdminEmail(count: number) {
  // Logic to send email
  console.log(`Sending email for ${count} anonymous feedbacks.`);
}

export async function sendNamedAdminEmail(name: string, count: number) {
  console.log(`Sending email for ${count} feedbacks from ${name}.`);
}

export async function sendEmployeeConfirmationEmail(email: string, name: string) {
  console.log(`Sending confirmation email to ${email}.`);
}
