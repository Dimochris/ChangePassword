import React, { useState } from "react";
import {
  Form,
  Input,
  Button,
  Progress,
  Typography,
  Tooltip,
  message,
  Carousel,
} from "antd";
import commonPasswords from "./common-passwords";
import "./ChangePasswordForm.css";

const { Text, Title } = Typography;

const passwordChecks = [
  {
    label: "Τουλάχιστον 8 χαρακτήρες",
    tooltip: "Ο κωδικός πρέπει να έχει τουλάχιστον 8 χαρακτήρες.",
    test: (pw) => pw.length >= 8,
  },
  {
    label: "Ένα κεφαλαίο γράμμα",
    tooltip: "Χρειάζεται τουλάχιστον ένα κεφαλαίο ελληνικό ή λατινικό γράμμα.",
    test: (pw) => /[A-ZΑ-ΩΆΈΉΊΌΎΏΪΫ]/.test(pw),
  },
  {
    label: "Ένα πεζό γράμμα",
    tooltip: "Χρειάζεται τουλάχιστον ένα πεζό ελληνικό ή λατινικό γράμμα.",
    test: (pw) => /[a-zα-ωάέήίόύώϊϋΐΰ]/.test(pw),
  },
  {
    label: "Ένα νούμερο",
    tooltip: "Χρειάζεται τουλάχιστον έναν αριθμό (0-9).",
    test: (pw) => /[0-9]/.test(pw),
  },
  {
    label: "Ένας ειδικός χαρακτήρας (!@#$%^&*()_-+=,.?~{}[])",
    tooltip:
      "Χρειάζεται τουλάχιστον έναν από τους ειδικούς χαρακτήρες: !@#$%^&*()_-+=,.?~{}[]",
    test: (pw) => /[!@#$%^&*()_\-+=,.?~{}\[\]]/.test(pw),
  },
];

const getPasswordStrength = (password) => {
  return passwordChecks.reduce(
    (acc, check) => acc + (check.test(password) ? 1 : 0),
    0
  );
};

const getStrengthLabel = (score) => {
  if (score <= 2) return { label: "Αδύναμος", color: "red", percent: 40 };
  if (score <= 4) return { label: "Μέτριος", color: "orange", percent: 70 };
  return { label: "Δυνατός", color: "green", percent: 100 };
};

const PasswordChecklist = ({ password }) => (
  <ul style={{ paddingLeft: 20, listStyle: "none" }}>
    {passwordChecks.map((check, index) => {
      const passed = check.test(password);
      return (
        <li key={index} style={{ color: passed ? "green" : "gray" }}>
          {passed ? "✓" : "✗"}{" "}
          <Tooltip title={check.tooltip}>
            <span
              style={{ cursor: "help", textDecoration: "underline dotted" }}
            >
              {check.label}
            </span>
          </Tooltip>
        </li>
      );
    })}
  </ul>
);

const passwordTips = [
  "Χρησιμοποίησε τουλάχιστον 8 χαρακτήρες.",
  "Συνδύασε κεφαλαία, πεζά, αριθμούς και ειδικούς χαρακτήρες.",
  "Απέφυγε προσωπικά στοιχεία όπως όνομα ή ημερομηνία γέννησης.",
  "Μην χρησιμοποιείς τον ίδιο κωδικό σε πολλές υπηρεσίες.",
  "Απέφυγε κοινές λέξεις ή ακολουθίες (π.χ. 123456, password).",
  "Μην χρησιμοποιείς εύκολα προβλέψημους κωδικούς.",
  "Χρησιμοποίησε φράσεις ή συνδυασμούς λέξεων για μεγαλύτερη ασφάλεια.",
  "Ανανέωνε τους κωδικούς σου τακτικά.",
  "Χρησιμοποίησε διαχειριστές κωδικών για να αποθηκεύσεις τους κωδικούς σου με ασφάλεια.",
  "Μην μοιράζεσαι τους κωδικούς σου με κανέναν.",
  "Απόφυγε να αποθηκεύεις κωδικούς σε δημόσιους υπολογιστές ή συσκευές.",
];

const ChangePasswordForm = () => {
  const [form] = Form.useForm();
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [capsLockOn, setCapsLockOn] = useState(false); // ΝΕΟ

  const strengthScore = getPasswordStrength(newPassword);
  const strength = getStrengthLabel(strengthScore);

  const currentPassword = form.getFieldValue("currentPassword");
  const canSubmit =
    strengthScore >= 4 &&
    strength.percent > 80 &&
    newPassword &&
    currentPassword &&
    newPassword !== currentPassword &&
    !commonPasswords.includes(newPassword.toLowerCase()) &&
    confirmPassword === newPassword &&
    !/\s/.test(newPassword); // Προστέθηκε αυτός ο έλεγχος

  const onFinish = (values) => {
    message.success("Ο κωδικός άλλαξε με επιτυχία!");
    form.resetFields();
    setNewPassword("");
    setConfirmPassword("");
  };

  return (
    <div className="glass-card">
      <Title
        level={3}
        style={{ color: "white", textAlign: "center", marginBottom: 24 }}
      >
        Αλλαγή Κωδικού Πρόσβασης
      </Title>
      <Form
        layout="vertical"
        onFinish={onFinish}
        form={form}
        style={{ maxWidth: 400, margin: "auto", marginTop: 0 }}
      >
        <Form.Item
          label="Τρέχων Κωδικός"
          name="currentPassword"
          rules={[{ required: true, message: "Απαιτείται ο τρέχων κωδικός" }]}
        >
          <Input.Password autoComplete="current-password" />
        </Form.Item>

        <Form.Item
          label="Νέος Κωδικός"
          name="newPassword"
          rules={[
            { required: true, message: "Ο νέος κωδικός είναι υποχρεωτικός" },
            {
              validator: (_, value) => {
                if (!value) return Promise.resolve();
                if (/\s/.test(value)) {
                  return Promise.reject("Ο κωδικός δεν επιτρέπεται να περιέχει κενά.");
                }
                if (getPasswordStrength(value) < 4) {
                  return Promise.reject("Ο κωδικός δεν πληροί τα απαιτούμενα");
                }
                if (form.getFieldValue("currentPassword") === value) {
                  return Promise.reject(
                    "Ο νέος κωδικός δεν μπορεί να είναι ίδιος με τον τρέχοντα"
                  );
                }
                if (commonPasswords.includes(value.toLowerCase())) {
                  return Promise.reject(
                    "Ο κωδικός είναι πολύ κοινός. Διάλεξε έναν πιο σύνθετο."
                  );
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
            onKeyUp={(e) => setCapsLockOn(e.getModifierState && e.getModifierState("CapsLock"))}
          />
        </Form.Item>
        {capsLockOn && (
          <Text type="warning" style={{ marginBottom: 8, display: "block" }}>
            Προσοχή: Το Caps Lock είναι ενεργό!
          </Text>
        )}

        {newPassword && (
          <>
            <PasswordChecklist password={newPassword} />
            <Progress
              percent={strength.percent}
              strokeColor={strength.color}
              showInfo={false}
            />
            <Text type="secondary">{strength.label}</Text>
          </>
        )}

        <Form.Item
          label="Επιβεβαίωση Νέου Κωδικού"
          name="confirmPassword"
          dependencies={["newPassword"]}
          rules={[
            { required: true, message: "Επιβεβαίωσε τον νέο κωδικό" },
            ({ getFieldValue }) => ({
              validator(_, value) {
                if (!value || getFieldValue("newPassword") === value) {
                  return Promise.resolve();
                }
                return Promise.reject("Οι κωδικοί δεν ταιριάζουν");
              },
            }),
          ]}
        >
          <Input.Password
            autoComplete="new-password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            onCopy={(e) => e.preventDefault()}
            onPaste={(e) => e.preventDefault()}
            onCut={(e) => e.preventDefault()}
          />
        </Form.Item>

        {/* Carousel με συμβουλές */}
        <div style={{ marginBottom: 20 }}>
          <Carousel autoplay dots>
            {passwordTips.map((tip, idx) => (
              <div key={idx}>
                <div
                  style={{
                    color: "#fff",
                    textAlign: "center",
                    minHeight: 60,
                    paddingBottom: 24,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  {tip}
                </div>
              </div>
            ))}
          </Carousel>
        </div>

        <Form.Item style={{ marginTop: 20 }}>
          <Button
            type="primary"
            htmlType="submit"
            block
            disabled={!canSubmit}
            className="glass-btn"
          >
            Αλλαγή Κωδικού
          </Button>
        </Form.Item>

        {newPassword &&
          commonPasswords.includes(newPassword.toLowerCase()) && (
            <Text type="danger" style={{ display: "block", marginBottom: 8 }}>
              Ο κωδικός που πληκτρολόγησες είναι πολύ κοινός. Διάλεξε έναν πιο σύνθετο!
            </Text>
          )}
      </Form>
    </div>
  );
};

export default ChangePasswordForm;
