import React, { useState } from 'react';
import { Form, Input, Button, Progress, Typography, Tooltip } from 'antd';
import commonPasswords from './common-passwords';

const { Text } = Typography;

const passwordChecks = [
  {
    label: 'Τουλάχιστον 8 χαρακτήρες',
    tooltip: 'Ο κωδικός πρέπει να έχει τουλάχιστον 8 χαρακτήρες.',
    test: (pw) => pw.length >= 8,
  },
  {
    label: 'Ένα κεφαλαίο γράμμα',
    tooltip: 'Χρειάζεται τουλάχιστον ένα κεφαλαίο ελληνικό ή λατινικό γράμμα.',
    test: (pw) => /[A-ZΑ-ΩΆΈΉΊΌΎΏΪΫ]/.test(pw),
  },
  {
    label: 'Ένα πεζό γράμμα',
    tooltip: 'Χρειάζεται τουλάχιστον ένα πεζό ελληνικό ή λατινικό γράμμα.',
    test: (pw) => /[a-zα-ωάέήίόύώϊϋΐΰ]/.test(pw),
  },
  {
    label: 'Ένα νούμερο',
    tooltip: 'Χρειάζεται τουλάχιστον έναν αριθμό (0-9).',
    test: (pw) => /[0-9]/.test(pw),
  },
  {
    label: 'Ένας ειδικός χαρακτήρας (!@#$%^&*()_-+=,.?~{}[])',
    tooltip: 'Χρειάζεται τουλάχιστον έναν από τους ειδικούς χαρακτήρες: !@#$%^&*()_-+=,.?~{}[]',
    test: (pw) => /[!@#$%^&*()_\-+=,.?~{}\[\]]/.test(pw),
  },
];

const getPasswordStrength = (password) => {
  return passwordChecks.reduce((acc, check) => acc + (check.test(password) ? 1 : 0), 0);
};

const getStrengthLabel = (score) => {
  if (score <= 2) return { label: 'Αδύναμος', color: 'red', percent: 40 };
  if (score <= 4) return { label: 'Μέτριος', color: 'orange', percent: 70 };
  return { label: 'Δυνατός', color: 'green', percent: 100 };
};

const PasswordChecklist = ({ password }) => (
  <ul style={{ paddingLeft: 20, listStyle: 'none' }}>
    {passwordChecks.map((check, index) => {
      const passed = check.test(password);
      return (
        <li key={index} style={{ color: passed ? 'green' : 'gray' }}>
          {passed ? '✓' : '✗'}{' '}
          <Tooltip title={check.tooltip}>
            <span style={{ cursor: 'help', textDecoration: 'underline dotted' }}>{check.label}</span>
          </Tooltip>
        </li>
      );
    })}
  </ul>
);

const ChangePasswordForm = () => {
  const [form] = Form.useForm();
  const [newPassword, setNewPassword] = useState('');

  const strengthScore = getPasswordStrength(newPassword);
  const strength = getStrengthLabel(strengthScore);

  const currentPassword = form.getFieldValue('currentPassword');
  const canSubmit =
    strengthScore >= 4 &&
    strength.percent > 80 &&
    newPassword &&
    currentPassword &&
    newPassword !== currentPassword &&
    !commonPasswords.includes(newPassword.toLowerCase());

  const onFinish = (values) => {
    console.log('🔐 Νέος Κωδικός:', values.newPassword);
    // Υποβολή στο backend εδώ

    form.resetFields();    // Διαγραφή όλων των πεδίων της φόρμας
    setNewPassword('');    // Καθαρισμός του state για το νέο κωδικό
  };

  return (
    <Form
      layout="vertical"
      onFinish={onFinish}
      form={form}
      style={{ maxWidth: 400, margin: 'auto', marginTop: 100 }}
    >
      <Form.Item
        label="Τρέχων Κωδικός"
        name="currentPassword"
        rules={[{ required: true, message: 'Απαιτείται ο τρέχων κωδικός' }]}
      >
        <Input.Password autoComplete="current-password" />
      </Form.Item>

      <Form.Item
        label="Νέος Κωδικός"
        name="newPassword"
        rules={[
          { required: true, message: 'Ο νέος κωδικός είναι υποχρεωτικός' },
          {
            validator: (_, value) => {
              if (!value) return Promise.resolve();
              if (getPasswordStrength(value) < 4) {
                return Promise.reject('Ο κωδικός δεν πληροί τα απαιτούμενα');
              }
              if (form.getFieldValue('currentPassword') === value) {
                return Promise.reject('Ο νέος κωδικός δεν μπορεί να είναι ίδιος με τον τρέχοντα');
              }
              // Έλεγχος για κοινούς κωδικούς
              if (commonPasswords.includes(value.toLowerCase())) {
                return Promise.reject('Ο κωδικός είναι πολύ κοινός. Διάλεξε έναν πιο σύνθετο.');
              }
              return Promise.resolve();
            },
          },
        ]}
      >
        <Input.Password
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          autoComplete="new-password"
        />
      </Form.Item>

      {newPassword && (
        <>
          <PasswordChecklist password={newPassword} />
          <Progress percent={strength.percent} strokeColor={strength.color} showInfo={false} />
          <Text type="secondary">{strength.label}</Text>
        </>
      )}

      <Form.Item
        label="Επιβεβαίωση Νέου Κωδικού"
        name="confirmPassword"
        dependencies={['newPassword']}
        rules={[
          { required: true, message: 'Επιβεβαίωσε τον νέο κωδικό' },
          ({ getFieldValue }) => ({
            validator(_, value) {
              if (!value || getFieldValue('newPassword') === value) {
                return Promise.resolve();
              }
              return Promise.reject('Οι κωδικοί δεν ταιριάζουν');
            },
          }),
        ]}
      >
        <Input.Password
          autoComplete="new-password"
          onCopy={(e) => e.preventDefault()}
          onPaste={(e) => e.preventDefault()}
          onCut={(e) => e.preventDefault()}
        />
      </Form.Item>

      <Form.Item style={{ marginTop: 20 }}>
        <Button type="primary" htmlType="submit" block disabled={!canSubmit}>
          Αλλαγή Κωδικού
        </Button>
      </Form.Item>
    </Form>
  );
};

export default ChangePasswordForm;
