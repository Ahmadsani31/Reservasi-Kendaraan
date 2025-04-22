
import { AlertCircle, CameraIcon, CameraOff, CircleArrowOutUpLeft, FuelIcon, Gauge, Loader2 } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Webcam from "react-webcam";
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from "@/components/ui/alert"


import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"

import api from '@/api/service';
import { CustomAlert } from "@/components/CostumAlert";

import { useEffect, useRef, useState } from 'react';
import { toast } from 'sonner';
import { useGeolocated } from 'react-geolocated';
import { useNavigate, useParams } from 'react-router-dom';

import { format } from 'date-fns';
import { Skeleton } from '@/components/ui/skeleton';

type Props = {
  checkpointID: string;
  setLoading: (value: boolean) => void;
};

interface Checkpoint {
  id: number;
  checkpoint_name: string;
  created_at: string;
  data: Bbm[];
}

interface Bbm {
  id: number;
  reservasi_id: string;
  checkpoint_id: string;
  checkpoint_name: string;
  jenis: string;
  uang: string;
  liter: string;
  image: string;
  created_at: string;
}



const Checkpoint = ({ checkpointID, setLoading }: Props) => {

  const [open, setOpen] = useState<boolean>(false);
  const [openCamera, setOpenCamera] = useState<boolean>(false);

  const [errors, setErrors] = useState({ kegiatan: '', spidometer: '', jenis: '', liter: '', uang: '' });

  const [isActive, setIsActive] = useState<boolean>(false);
  const [voucherAktif, setVoucherAktif] = useState<boolean>(false);
  const [uangActive, setUangActive] = useState<boolean>(false);
  const [selectedId, setSelectedId] = useState<string>("");

  const [form, setForm] = useState({
    checkpoint_id: checkpointID,
    checkpoint_name: '',
    reservasi_id: localStorage.getItem('reservasi_id'),
    jenis: "",
    uang: "",
    liter: "",
    latitude: "",
    longitude: "",
    fileImage: null
  })


  const { coords, getPosition, isGeolocationAvailable, isGeolocationEnabled } = useGeolocated({
    positionOptions: {
      enableHighAccuracy: true,
      maximumAge: 0,
      timeout: Infinity,
    },
    watchPosition: false,
    userDecisionTimeout: 5000,
  });

  // useEffect(() => {
  // console.log('location load');
  // setForm({
  //   ...form,
  //   latitude: coords?.latitude ? coords.latitude.toString() : "",
  //   longitude: coords?.longitude ? coords.longitude.toString() : "",
  // })


  // }, [coords]);

  const [row, setRow] = useState<Checkpoint[]>([])

  useEffect(() => {

    fetchData();

  }, []);

  const fetchData = async () => {
    setLoading(true)
    const reservasi_id = localStorage.getItem('reservasi_id');
    if (reservasi_id) {
      try {
        const res = await api.get(`/checkpoint/bbm`, {
          params: {
            reservasi_id: reservasi_id,
          },
        });
        setRow(res.items);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false)
      }
    }

  };

  const webcamRef = useRef<Webcam | null>(null);
  const [image, setImage] = useState<string | null>(null);

  const captureImage = async () => {
    if (webcamRef.current) {
      const imageSrc = webcamRef.current.getScreenshot();
      const blob = await fetch(imageSrc).then(res => res.blob());
      setForm({
        ...form,
        fileImage: blob,
      })
      setImage(imageSrc);
      // setOpen(!open)
      // setIsActive(!isActive)
    }
  };

  const retakeImage = () => {
    setImage(null);
    // setOpen(!open)
    setIsActive(!isActive)
    // setForm({ ...form, spidometer: '' });
  };


  const handelInput = (event: any) => {
    event.preventDefault();
    const { name, value } = event.target;
    console.log(name, value)
    setForm({ ...form, [name]: value });
  }


  const validateForm = () => {
    const newErrors = { kegiatan: '', spidometer: '', jenis: '', liter: '', uang: '' };
    let isValid = true;

    if (!form.jenis) {
      newErrors.jenis = 'Jenis wajib diisi';
      isValid = false;
    }

    if (selectedId === 'Voucher') {
      if (!form.liter) {
        newErrors.liter = 'Liter wajib diisi';
        isValid = false;
      }
    } else {
      if (!form.uang) {
        newErrors.uang = 'Nominal wajib diisi';
        isValid = false;
      }
    }

    if (!form.fileImage) {
      toast.error('Struck pembelian wajib di capture!')
      isValid = false;
    }

    setErrors(newErrors);

    return isValid;
  };

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    // Ambil posisi terbaru
    getPosition();

    if (!validateForm()) return;

    if (!isGeolocationAvailable) {
      toast.error("Your browser does not support Geolocation.");
      return;
    }

    if (isGeolocationEnabled !== true) {
      toast.error("Geolocation is not enabled. Please enable it in your browser settings.");
      return;
    }

    setLoading(true)
    try {

      const formData = new FormData();

      formData.append('fileImage', form.fileImage, 'spidometer-capture.png');
      formData.append('reservasi_id', form.reservasi_id);
      formData.append('checkpoint_id', form.checkpoint_id);
      formData.append('latitude', coords?.latitude ? coords.latitude.toString() : "");
      formData.append('longitude', coords?.longitude ? coords.longitude.toString() : "");
      formData.append('jenis', form.jenis);
      formData.append('uang', form.uang);
      formData.append('liter', form.liter);

      const response = await api.postForm(`/checkpoint/save_fuel`, formData)
      if (response.status === true) {
        setOpen(!open);
        toast.success(response.message)
        fetchData();

        setForm({
          ...form,
          fileImage: null,
          latitude: "",
          longitude: "",
          jenis: "",
          uang: "",
          liter: "",
        })

        setImage(null)
        setSelectedId("")
        setOpenCamera(false)
      } else {
        toast.error(response.message)
      }

    } catch (error) {
      console.error("Error uploading image:", error);
    } finally {
      setLoading(false);
    }
  }


  const handleChangeSelect = (value: string) => {
    setVoucherAktif(false);
    setUangActive(false);
    setErrors({
      ...errors,
      jenis: ''
    });
    setSelectedId(value);

    setForm({
      ...form,
      jenis: value,
    })

    if (value == 'Voucher') {
      setVoucherAktif(true);
    } else {
      setUangActive(true);
    }
  };

  const handleOpenCamera = () => {
    setOpenCamera(true)
  };

  const handleLogout = async () => {
    setLoading(true);
    getPosition();

    if (!isGeolocationAvailable) {
      toast.error("Your browser does not support Geolocation.");
      return;
    }

    if (isGeolocationEnabled !== true) {
      toast.error("Geolocation is not enabled. Please enable it in your browser settings.");
      return;
    }

    const formData = new FormData();

    formData.append('checkpoint_id', form.checkpoint_id);
    formData.append('latitude', coords?.latitude ? coords.latitude.toString() : "");
    formData.append('longitude', coords?.longitude ? coords.longitude.toString() : "");

    try {
      const response = await api.postForm(`/checkpoint/exit`, formData)
      if (response.status === true) {
        toast.success(response.message)
        window.location.reload();
      } else {
        toast.error(response.message)
      }
    } catch (error) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }

  }


  return (
    <>
      <h2 className="section-title">Popular Topics</h2>
      <div className="my-2">
        <Card className="p-4 space-y-2">

          <CustomAlert
            title="Keluar dari Pengisian BBM"
            description="Apakah kamu yakin ingin keluar dari proses pengisian BBM?"
            confirmText="Keluar"
            cancelText="Batal"
            onConfirm={handleLogout}
            trigger={<Button variant="ghost" className='w-full bg-red-500 hover:bg-red-600 text-white'>
              <CircleArrowOutUpLeft /> Keluar
            </Button>}
          />
          <Button variant="ghost" onClick={() => setOpen(!open)} className='w-full bg-teal-500 text-white'>
            <FuelIcon /> Isi BBM
          </Button>
        </Card>
      </div>
      <div className='space-y-4'>
        <h2 className="section-title text-sm">Log Pengisiian BBM</h2>
      </div>
      <div className="space-y-4">
        {
          row.length > 0 ?
            row.map((item, index) => (
              <Card key={index}>
                <div className="flex justify-between items-center p-2 bg-gray-200 rounded-t-md">
                  <h3 className='font-bold'>{item.checkpoint_name}</h3>
                  <span className="text-sm text-gray-500">{format(new Date(item.created_at), "cccc, d LLL y | HH:mm")}</span>
                </div>
                {item?.data.length > 0 ?
                  item?.data.map((itx, i) => (
                    <CardContent className='py-2' key={i}>
                      <p className=" font-medium text-sm">{i + 1}. Pengisiian BBM</p>
                      <span className='text-sm'>{itx.jenis} </span> : <span className="text-sm">{itx.jenis == 'Voucher' ? `${itx.liter} Liter` : `Nominal Rp.${parseFloat(Number(itx.uang).toFixed(2)).toLocaleString()}`}</span>
                      <Accordion type="single" collapsible className="w-full px-5 bg-slate-300 rounded-sm">
                        <AccordionItem value="item-1">
                          <AccordionTrigger>Klik untuk lihat gambar</AccordionTrigger>
                          <AccordionContent>
                            <img
                              src={itx.image}
                              alt="gambar"
                              className="w-full rounded-sm "
                            />
                          </AccordionContent>
                        </AccordionItem>
                      </Accordion>
                    </CardContent>
                  )) : (
                    <CardContent className='py-2'>
                      <Alert>
                        <AlertCircle className="h-4 w-4" />
                        <AlertTitle>Kosong</AlertTitle>
                        <AlertDescription>
                          Tidak ada pengisian BBM
                        </AlertDescription>
                      </Alert>
                    </CardContent>
                  )
                }
              </Card>
            ))
            : (
              <Card className='p-5'>
                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>Kosong</AlertTitle>
                  <AlertDescription>
                    Tidak ada data
                  </AlertDescription>
                </Alert>
              </Card>
            )
        }



      </div>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Pengisiaan BBM</DialogTitle>
            <DialogDescription>
              Proses pengisian BBM kendaraan
            </DialogDescription>
          </DialogHeader>
          <div className="p-1 overflow-auto scrollbar-hide max-h-max h-[calc(100vh-200px)]">
            <form onSubmit={handleSubmit} method="post">
              <div className="mb-3">
                <Label htmlFor="jenis" className='block text-sm font-medium mb-2'>Jenis</Label>
                <Select onValueChange={handleChangeSelect} value={selectedId}>
                  <SelectTrigger className={`w-full  ${errors.jenis ? "border-red-500" : ""}`}>
                    <SelectValue placeholder="Jenis Pengisian" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      <SelectItem value="Voucher">Voucher</SelectItem>
                      <SelectItem value="Uang">Uang</SelectItem>
                    </SelectGroup>
                  </SelectContent>
                </Select>
                {errors.jenis && (
                  <p className="text-sm ms-1 text-red-500">{errors.jenis}</p>
                )}
              </div>
              <div className={`mb-3 ${voucherAktif ? '' : 'hidden'}`}>
                <Label htmlFor="liter" className='block text-sm font-medium mb-2'>Liter</Label>
                <Input type="number" name="liter" id='liter' value={form.liter} onChange={handelInput} className={errors.liter ? "border-red-500" : ""} placeholder="Liter" />
                {errors.liter && (
                  <p className="text-sm ms-1 text-red-500">{errors.liter}</p>
                )}
              </div>
              <div className={`mb-3 ${uangActive ? '' : 'hidden'}`}>
                <Label htmlFor="uang" className='block text-sm font-medium mb-2'>Nominal</Label>
                <Input type="number" name="uang" id='uang' value={form.uang} onChange={handelInput} className={errors.uang ? "border-red-500" : ""} placeholder="Nominal Uang" />
                {errors.uang && (
                  <p className="text-sm ms-1 text-red-500">{errors.uang}</p>
                )}
              </div>
              <div className='mb-3'>
                {image ? (
                  <>
                    <div className="relative">
                      <img src={image} alt="Image" className="w-full rounded-lg shadow-lg" />
                      <button type='button' onClick={retakeImage} className="flex items-center absolute bottom-0 right-0 bg-amber-500 text-white px-3 py-1 rounded-sm"><CameraOff className='mr-2' />ambil ulang foto</button>
                    </div>
                  </>
                ) : openCamera ? (
                  <>
                    <Webcam ref={webcamRef} screenshotFormat="image/png" videoConstraints={{ facingMode: "environment" }} className="w-full rounded-lg shadow-lg" />
                    <Button type='button' variant="ghost" onClick={captureImage} className='w-full bg-teal-500 hover:bg-teal-300 text-white'>
                      <CameraIcon /> Ambil Foto
                    </Button>
                  </>
                ) : null}
                <Button type='button' variant="ghost" onClick={handleOpenCamera} className={`w-full bg-blue-500 text-white ${openCamera ? "hidden" : ""}`}>
                  <CameraIcon /> Open Kamera
                </Button>
              </div>
              <DialogFooter className='gap-2'>
                <Button type="submit" className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white">
                  Simpan
                </Button>
              </DialogFooter>
            </form>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default Checkpoint;
