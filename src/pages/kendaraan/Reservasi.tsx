
import React, { useEffect, useRef, useState } from 'react';

import { Camera, CameraOff, CircleArrowOutUpLeft, Loader2, MapPinCheck } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogClose
} from "@/components/ui/dialog"
import { AlertCircle } from "lucide-react"
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from "@/components/ui/alert"

import { Skeleton } from "@/components/ui/skeleton"

import Webcam from "react-webcam";
import { useGeolocated } from "react-geolocated";
import api from '@/api/service';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { format } from 'date-fns';

type Props = {
  setLoading: (value: boolean) => void;
};


const Reservasi = ({ setLoading }: Props) => {
  const navigate = useNavigate();

  const webcamRef = useRef<Webcam | null>(null);
  const [image, setImage] = useState<string | null>(null);
  const [imageExit, setImageExit] = useState<string | null>(null);
  const [dialogCheckpoint, setDialogCheckpoint] = useState<boolean>(false);
  const [dialogExit, setDialogExit] = useState<boolean>(false);
  const [errors, setErrors] = useState({ spidometer: '' });
  const [isLoading, setIsLoading] = useState(false);
  const [reservasiAktif, setReservasiAktif] = useState(false);

  const { coords, getPosition, isGeolocationAvailable, isGeolocationEnabled } = useGeolocated({
    positionOptions: {
      enableHighAccuracy: true,
      maximumAge: 0,
      timeout: Infinity,
    },
    watchPosition: false,
    userDecisionTimeout: 5000,
  });

  const [formExit, setFormExit] = useState({
    kendaraan_id: "",
    spidometer: "",
    fileImage: null
  })

  const [formCheckpoint, setFormCheckpoint] = useState({
    fileImage: null
  })

  const [row, setRow] = useState({
    kegiatan: "",
    name: "",
    no_polisi: "",
    created_at: "",
  })

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const res = await api.get(`/reservasi/aktif`);
        if (res.status === true) {
          setReservasiAktif(true);
          localStorage.setItem('reservasi_id', res.items.id);
          setRow({
            kegiatan: res.items.kegiatan,
            name: res.items.model,
            no_polisi: res.items.no_polisi,
            created_at: res.items.created_at,
          })
        }

      } catch (error) {
        setReservasiAktif(false);
        console.error('Error fetching data:', error);
      } finally {
        setIsLoading(false);
      }

    };

    fetchData();

  }, []);

  const captureImage = async () => {
    if (webcamRef.current) {
      const imageSrc = webcamRef.current.getScreenshot();
      const blob = await fetch(imageSrc).then(res => res.blob());
      setImage(imageSrc);
      setFormCheckpoint({
        ...formCheckpoint,
        fileImage: blob,
      })
    }
  };

  const captureImageExit = async () => {
    if (webcamRef.current) {
      const imageSrc = webcamRef.current.getScreenshot();
      const blob = await fetch(imageSrc).then(res => res.blob());
      setImageExit(imageSrc);
      setFormExit({
        ...formExit,
        fileImage: blob,
      })
    }
  };


  const retakeImage = () => {
    setImage(null);
    setImageExit(null);
  };

  const handelInput = (event: any) => {
    event.preventDefault();
    const { name, value } = event.target;
    setFormExit({ ...formExit, [name]: value });
  }

  const validateForm = () => {
    const newErrors = { spidometer: '' };
    let isValid = true;


    if (!formExit.spidometer) {
      newErrors.spidometer = 'Spidometer wajib diisi';
      isValid = false;
    }

    if (!formExit.fileImage) {
      toast.error('Capture spidometer kendaraan wajib diambil!')
      isValid = false;
    }

    setErrors(newErrors);

    return isValid;
  };
  async function handleSubmitCheckpoint(e: React.FormEvent) {
    e.preventDefault();
    getPosition();
    if (!isGeolocationAvailable) {
      toast.error("Your browser does not support Geolocation.");
      return;
    }

    if (isGeolocationEnabled !== true) {
      toast.error("Geolocation is not enabled. Please enable it in your browser settings.");
      return;
    }

    if (!coords) {
      toast.error("Load location.");
      return;
    }

    setLoading(true);

    try {
      const reservasi_id = localStorage.getItem('reservasi_id');
      const formData = new FormData();
      formData.append('fileImage', formCheckpoint.fileImage, 'checkpoint.png');
      formData.append('latitude', coords?.latitude ? coords.latitude.toString() : "");
      formData.append('longitude', coords?.longitude ? coords.longitude.toString() : "");
      formData.append('reservasi_id', reservasi_id);
      const response = await api.postForm(`/checkpoint/save`, formData)
      if (response.status === true) {
        toast.success(response.message)
        setDialogCheckpoint(false);
        window.location.reload();
      } else {
        toast.error(response.message)
      }
    } catch (error) {
      console.error("Error uploading image:", error);
      toast.error(error.message)
    } finally {
      setLoading(false);
    }

  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
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
    if (!coords) {
      toast.error("Load location.");
      return;
    }

    setLoading(true);

    try {
      const reservasi_id = localStorage.getItem('reservasi_id');
      const formData = new FormData();

      formData.append('fileImage', formExit.fileImage, 'spidometer-capture.png');
      formData.append('spidometer', formExit.spidometer);
      formData.append('latitude', coords?.latitude ? coords.latitude.toString() : "");
      formData.append('longitude', coords?.longitude ? coords.longitude.toString() : "");
      formData.append('reservasi_id', reservasi_id);

      const response = await api.postForm(`/reservasi/return_kendaraan`, formData)
      if (response.status === true) {
        toast.success(response.message)
        localStorage.removeItem('reservasi_id');
        navigate('/');
      } else {
        toast.error(response.message)
      }

    } catch (error) {
      console.error("Error uploading image:", error);

    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      {isLoading ? (
        <Card className='mb-5'>
          <div className="flex flex-col space-y-3 justify-center items-center p-10">
            <Skeleton className="h-8 w-96" />
            <Skeleton className="h-8 w-96" />
            <Skeleton className="h-8 w-96" />
          </div>
        </Card>
      ) : reservasiAktif ? (
        <>
          <Card className='mb-5'>
            <CardHeader className='text-center'>
              <CardTitle>{row.name}</CardTitle>
              <CardDescription>{row.no_polisi}</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground text-center bg-blue-100 text-gray-950 rounded-sm p-1">{row.kegiatan}</p>
              <p className="text-muted-foreground text-center text-xs text-gray-950 rounded-sm p-1">{format(row.created_at, 'cccc, d LLL y | HH:mm')}</p>
            </CardContent>
          </Card>
          <div className="my-2">
            <Card className="p-4">
              <Button type='button' variant="ghost" onClick={() => setDialogCheckpoint(!dialogCheckpoint)} className='w-full bg-teal-500 text-white'>
                <MapPinCheck /> Proses Pengisiaan BBM
              </Button>
            </Card>
          </div>
          <div className="my-2">
            <Card className="p-4">
              <Button variant="ghost" onClick={() => setDialogExit(!dialogExit)} className='w-full bg-yellow-500 text-white'>
                <CircleArrowOutUpLeft /> Kembalikan Mobil
              </Button>
            </Card>
          </div>
        </>
      ) : (
        <Card className='p-5'>
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Empty</AlertTitle>
            <AlertDescription>
              Tidak ada pemakaian kendaraan yang aktif saat ini
            </AlertDescription>
          </Alert>
        </Card>
      )}


      <Dialog open={dialogCheckpoint} onOpenChange={setDialogCheckpoint}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Proses Pengisian BBM Kendaraan</DialogTitle>
            <DialogDescription>
              Silahkan foto kondisi terkini saat melakukan proses pengisian BBM Kendaraan
            </DialogDescription>
          </DialogHeader>
          <div className="overflow-auto scrollbar-hide max-h-max h-[calc(100vh-200px)]">
            <form onSubmit={handleSubmitCheckpoint} method="post">
              <div className="mb-3">
                {image ? (
                  <>
                    <div className='relative '>
                      <img src={image} alt="captured" className="w-full rounded-lg shadow-lg" />
                      <button type='button' onClick={retakeImage} className="flex items-center absolute bottom-0 right-0 bg-amber-500 text-white px-3 py-1 rounded-sm"><CameraOff className='mr-2' /> ambil ulang foto</button>
                    </div>

                  </>
                ) : (
                  <>
                    <Webcam ref={webcamRef} screenshotFormat="image/png" videoConstraints={{ facingMode: "environment" }} className="w-full rounded-lg shadow-lg" />
                  </>
                )}
              </div>
              <DialogFooter className='gap-2'>
                {image ? (
                  <>
                    <Button type="submit" className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white" disabled={isLoading}>
                      {isLoading ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Memproses...
                        </>
                      ) : (
                        'Simpan'
                      )}
                    </Button>
                  </>
                ) : (
                  <>
                    <Button type='button' variant="ghost" onClick={captureImage} className='w-full bg-teal-500 hover:bg-teal-300 text-white'>
                      <Camera /> Ambil Foto
                    </Button>
                  </>
                )}

              </DialogFooter>
            </form>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={dialogExit} onOpenChange={setDialogExit}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Proses Kembalikan Kendaraan</DialogTitle>
            <DialogDescription>
              Silahkan foto spidometer kendaraan yang terbaru
            </DialogDescription>
          </DialogHeader>
          <div className="p-1 overflow-auto scrollbar-hide max-h-max h-[calc(100vh-200px)]">
            <form onSubmit={handleSubmit} method="post">
              <div className="mb-3">
                {imageExit ? (
                  <>
                    <div className='relative '>
                      <img src={imageExit} alt="captured" className="w-full rounded-lg shadow-lg" />
                      <button type='button' onClick={retakeImage} className="flex items-center absolute bottom-0 right-0 bg-amber-500 text-white px-3 py-1 rounded-sm"><CameraOff className='mr-2' />ambil ulang foto</button>
                    </div>
                  </>
                ) : (
                  <>
                    <Webcam ref={webcamRef} screenshotFormat="image/png" videoConstraints={{ facingMode: "environment" }} className="w-full rounded-lg shadow-lg" />
                    <Button type='button' variant="ghost" onClick={captureImageExit} className='w-full bg-teal-500 hover:bg-teal-300 text-white'>
                      <Camera /> Ambil Foto
                    </Button>
                  </>
                )}
              </div>
              <div className="mb-3">
                <Label htmlFor="spidometer" className='block text-sm font-medium mb-2'>Nilai Spidometer</Label>
                <Input type="number" name="spidometer" id='spidometer' value={formExit.spidometer} onChange={handelInput} className={errors.spidometer ? "border-red-500" : ""} placeholder="Nilai spidometer" />
                {errors.spidometer && (
                  <p className="text-sm ms-1 text-red-500">{errors.spidometer}</p>
                )}
              </div>
              <DialogFooter>
                <div className="flex flex-col gap-2 w-full">
                  <Button type="submit" className=" bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white" disabled={isLoading}>
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Memproses...
                      </>
                    ) : (
                      'Simpan'
                    )}
                  </Button>
                  <DialogClose asChild className=" bg-amber-400 text-black" >
                    <Button type="button" variant="secondary">
                      Close
                    </Button>
                  </DialogClose>
                </div>

              </DialogFooter>
            </form>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default Reservasi;
