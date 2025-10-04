
// import React, { useEffect, useState } from 'react';
// import { View, Text, StyleSheet, Alert, TouchableOpacity, ActivityIndicator, Platform } from 'react-native';
// import { Camera, getAvailableCameraDevices, useCameraDevices } from 'react-native-vision-camera';
// import { useScanBarcodes, BarcodeFormat } from 'vision-camera-code-scanner';
// import BookService from '../api/BookService';
// import BorrowService from '../api/BorrowService';

// const ScanIsbnScreen = ({ navigation }) => {
//   const [hasPermission, setHasPermission] = useState(false);
//   const [scanned, setScanned] = useState(false);
//   const [loading, setLoading] = useState(false);

//   const devices = useCameraDevices();
//   const device = devices.back;

//   const [frameProcessor, barcodes] = useScanBarcodes([BarcodeFormat.EAN_13, BarcodeFormat.EAN_8]);

//   useEffect(() => {
//     (async () => {
//       const status = await Camera.requestCameraPermission();
//       setHasPermission(status === 'authorized');
//     })();
//   }, []);

//   useEffect(() => {
//     if (!scanned && barcodes.length > 0) {
//       const rawValue = barcodes[0]?.rawValue;
//       if (rawValue) {
//         handleBarcode(rawValue);
//       }
//     }
//   }, [barcodes]);



//   const handleBarcode = async (isbn) => {
//     setScanned(true);
//     setLoading(true);

//     try {
//       const book = await BookService.getBookByIsbn(isbn.trim());
//       if (!book) {
//         Alert.alert("Not found", `No book found with ISBN: ${isbn}`);
//         setScanned(false);
//         return;
//       }

//       Alert.alert(
//         "Book found",
//         `${book.title} by ${book.author}`,
//         [
//           {
//             text: "Borrow",
//             onPress: async () => {
//               try {
//                 const userId = 1; 
//                 await BorrowService.borrowBook(userId, book.bookId || book.id);
//                 Alert.alert("Success", "Book borrowed successfully");
//                 navigation.goBack();
//               } catch (err) {
//                 Alert.alert("Error", err.message || "Failed to borrow book");
//               }
//             }
//           },
//           {
//             text: "Return",
//             onPress: async () => {
//               try {
//                 const records = await BorrowService.getRecordsByBook(book.bookId || book.id);
//                 if (!records || records.length === 0) {
//                   Alert.alert("No record", "No record found for this book");
//                   return;
//                 }
//                 const lastRecord = records[records.length - 1];
//                 if (!lastRecord.id) {
//                   Alert.alert("Error", "No valid record to return");
//                   return;
//                 }
//                 await BorrowService.returnBook(lastRecord.id);
//                 Alert.alert("Success", "Book returned successfully");
//                 navigation.goBack();
//               } catch (err) {
//                 Alert.alert("Error", err.message || "Failed to return book");
//               }
//             }
//           },
//           {
//             text: "Cancel",
//             style: "cancel",
//             onPress: () => setScanned(false)
//           }
//         ],
//         { cancelable: true }
//       );
//     } catch (error) {
//       console.error("Scan error:", error.message);
//       Alert.alert("Error", error.message || "Failed to find book");
//       setScanned(false);
//     } finally {
//       setLoading(false);
//     }
//   };

//   if (!device || !hasPermission) {
//     const devices = useCameraDevices();
// const device = devices?.back;

// if (device == null) {
//     return (
//       <View style={styles.centered}>
//         <Text>No camera access</Text>
//       </View>
//     );
//   }

//   return (
//     <View style={styles.container}>
//       {loading && (
//         <View style={styles.loadingOverlay}>
//           <ActivityIndicator size="large" color="#ffffff" />
//         </View>
//       )}

//       <Camera
//         style={StyleSheet.absoluteFill}
//         device={device}
//         isActive={!scanned}
//         frameProcessor={frameProcessor}
//         frameProcessorFps={5}
//       />

//       {scanned && (
//         <TouchableOpacity
//           style={styles.rescanButton}
//           onPress={() => setScanned(false)}
//         >
//           <Text style={styles.rescanText}>Tap to Scan Again</Text>
//         </TouchableOpacity>
//       )}

//       <View style={styles.scanTextContainer}>
//         <Text style={styles.scanText}>Scan ISBN barcode</Text>
//       </View>
//     </View>
//   );
// };

// const styles = StyleSheet.create({
//   container: { flex: 1 },
//   centered: {
//     flex: 1,
//     justifyContent: 'center',
//     alignItems: 'center',
//   },
//   scanTextContainer: {
//     position: 'absolute',
//     top: 60,
//     alignSelf: 'center',
//     backgroundColor: 'rgba(0,0,0,0.6)',
//     padding: 10,
//     borderRadius: 6,
//   },
//   scanText: {
//     color: 'white',
//     fontSize: 16,
//   },
//   rescanButton: {
//     position: 'absolute',
//     bottom: 40,
//     alignSelf: 'center',
//     padding: 12,
//     backgroundColor: '#fff',
//     borderRadius: 8,
//   },
//   rescanText: {
//     fontSize: 16,
//     color: '#000',
//   },
//   loadingOverlay: {
//     ...StyleSheet.absoluteFillObject,
//     backgroundColor: 'rgba(0,0,0,0.4)',
//     justifyContent: 'center',
//     alignItems: 'center',
//     zIndex: 10,
//   },
// });

// export default ScanIsbnScreen;
