import { useState, useEffect } from 'react';
import { addDoc, collection, deleteDoc, doc, onSnapshot, orderBy, query, updateDoc } from 'firebase/firestore';
import { db } from '../config/firebaseconfig';

export const useAdminLogic = () => {
  // --- STATE: Data ---
  const [childrenList, setChildrenList] = useState([]);
  const [employeeList, setEmployeeList] = useState([]);
  const [departmentList, setDepartmentList] = useState([]);
  const [loading, setLoading] = useState(false);

  // --- STATE: UI ---
  const [activeTab, setActiveTab] = useState('dashboard');
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState(null);

  // --- STATE: Forms ---
  const [childName, setChildName] = useState('');
  const [childDept, setChildDept] = useState('');
  const [childAllergy, setChildAllergy] = useState(false);
  const [emailInput, setEmailInput] = useState('');
  const [guardianEmails, setGuardianEmails] = useState([]);

  const [empName, setEmpName] = useState('');
  const [empDept, setEmpDept] = useState('');
  const [empPhone, setEmpPhone] = useState('');
  const [empEmail, setEmpEmail] = useState('');

  const [deptName, setDeptName] = useState('');

  // --- STATE: Alert ---
  const [alertVisible, setAlertVisible] = useState(false);
  const [alertConfig, setAlertConfig] = useState({ title: '', message: '', buttons: [] });

  // --- DATA HENTING ---
  useEffect(() => {
    const unsubChild = onSnapshot(query(collection(db, "children"), orderBy("name")), snap => 
      setChildrenList(snap.docs.map(d => ({ id: d.id, ...d.data() }))));
    const unsubEmp = onSnapshot(query(collection(db, "employees"), orderBy("name")), snap => 
      setEmployeeList(snap.docs.map(d => ({ id: d.id, ...d.data() }))));
    const unsubDept = onSnapshot(query(collection(db, "departments"), orderBy("name")), snap => 
      setDepartmentList(snap.docs.map(d => ({ id: d.id, ...d.data() }))));

    return () => { unsubChild(); unsubEmp(); unsubDept(); };
  }, []);

  // --- HJELPEFUNKSJONER ---
  const showAlert = (title, message, buttons = []) => {
    if (buttons.length === 0) buttons = [{ text: "OK", onPress: () => setAlertVisible(false) }];
    setAlertConfig({ title, message, buttons });
    setAlertVisible(true);
  };
  const hideAlert = () => setAlertVisible(false);

  const resetForm = () => {
    setChildName(''); setChildDept(''); setChildAllergy(false); setGuardianEmails([]); setEmailInput('');
    setEmpName(''); setEmpDept(''); setEmpPhone(''); setEmpEmail('');
    setDeptName('');
    setEditId(null);
    setShowForm(false);
  };

  const getStats = () => {
    const totalChildren = childrenList.length;
    const totalEmployees = employeeList.length;
    const presentChildren = childrenList.filter(c => c.status === 'present').length;
    const allergyChildren = childrenList.filter(c => c.allergy).length;
    const deptStats = departmentList.map(dept => {
      const count = childrenList.filter(c => c.avdeling?.toLowerCase() === dept.name.toLowerCase()).length;
      return { name: dept.name, count };
    });
    return { totalChildren, totalEmployees, presentChildren, allergyChildren, deptStats };
  };

  // --- HANDLERS ---
  const handleEdit = (item, type) => {
    setEditId(item.id);
    setActiveTab(type);
    if (type === 'child') {
      setChildName(item.name); setChildDept(item.avdeling);
      setChildAllergy(item.allergy || false);
      setGuardianEmails(item.guardianEmails || []);
    } else if (type === 'employee') {
      setEmpName(item.name); setEmpDept(item.department); setEmpEmail(item.email); setEmpPhone(item.phone);
    } else if (type === 'department') {
      setDeptName(item.name);
    }
    setShowForm(true);
  };

  const handleDelete = (collectionName, id, name) => {
    showAlert("Slett oppføring", `Er du sikker på at du vil slette ${name}?`, [
        { text: "Avbryt", style: "cancel", onPress: hideAlert },
        { text: "Slett", style: "destructive", onPress: async () => {
            try { await deleteDoc(doc(db, collectionName, id)); hideAlert(); } 
            catch(e) { hideAlert(); showAlert("Feil", "Kunne ikke slette: " + e.message); }
        }}
    ]);
  };

  const handleSaveChild = async () => {
    if (!childName || guardianEmails.length === 0) return showAlert('Mangler info', 'Navn og foresatt må fylles ut.');
    setLoading(true);
    try {
      const data = { name: childName, avdeling: childDept, guardianEmails, allergy: childAllergy, image: `https://api.dicebear.com/7.x/avataaars/png?seed=${childName}` };
      if (editId) await updateDoc(doc(db, "children", editId), data);
      else await addDoc(collection(db, "children"), { ...data, status: 'home', isSick: false, checkInTime: null, createdAt: new Date() });
      showAlert('Suksess', 'Lagret!', [{text:"OK", onPress:()=>{hideAlert(); resetForm()}}]);
    } catch (e) { showAlert('Feil', 'Kunne ikke lagre.'); } finally { setLoading(false); }
  };

  const handleSaveEmployee = async () => {
    if (!empName || !empEmail) return showAlert('Mangler info', 'Navn og e-post må fylles ut.');
    setLoading(true);
    try {
      const data = { name: empName, department: empDept, email: empEmail.toLowerCase(), phone: empPhone, image: `https://api.dicebear.com/7.x/avataaars/png?seed=${empName}` };
      if (editId) await updateDoc(doc(db, "employees", editId), data);
      else await addDoc(collection(db, "employees"), { ...data, createdAt: new Date() });
      showAlert('Suksess', 'Lagret!', [{text:"OK", onPress:()=>{hideAlert(); resetForm()}}]);
    } catch (e) { showAlert('Feil', 'Kunne ikke lagre.'); } finally { setLoading(false); }
  };

  const handleSaveDepartment = async () => {
    if (!deptName) return showAlert('Mangler info', 'Skriv navn.');
    setLoading(true);
    try {
      if (editId) await updateDoc(doc(db, "departments", editId), { name: deptName });
      else await addDoc(collection(db, "departments"), { name: deptName, createdAt: new Date() });
      showAlert('Suksess', 'Lagret!', [{text:"OK", onPress:()=>{hideAlert(); resetForm()}}]);
    } catch (e) { showAlert('Feil', 'Kunne ikke lagre.'); } finally { setLoading(false); }
  };

  const addGuardianEmail = () => {
    const email = emailInput.trim().toLowerCase();
    if (email.includes('@') && !guardianEmails.includes(email)) { setGuardianEmails([...guardianEmails, email]); setEmailInput(''); }
    else showAlert('Ugyldig', 'Sjekk e-post.');
  };
  const removeGuardianEmail = (e) => setGuardianEmails(guardianEmails.filter(x => x !== e));

  // Returner ALT UI trenger
  return {
    childrenList, employeeList, departmentList, loading,
    activeTab, setActiveTab, showForm, setShowForm, editId, setEditId,
    // Skjema states
    forms: {
      child: { name: childName, setName: setChildName, dept: childDept, setDept: setChildDept, allergy: childAllergy, setAllergy: setChildAllergy, emails: guardianEmails, emailInput, setEmailInput },
      employee: { name: empName, setName: setEmpName, dept: empDept, setDept: setEmpDept, phone: empPhone, setPhone: setEmpPhone, email: empEmail, setEmail: setEmpEmail },
      department: { name: deptName, setName: setDeptName }
    },
    // Funksjoner
    getStats, handleEdit, handleDelete, resetForm,
    handleSaveChild, handleSaveEmployee, handleSaveDepartment,
    addGuardianEmail, removeGuardianEmail,
    // Alert
    alert: { visible: alertVisible, config: alertConfig, hide: hideAlert }
  };
};