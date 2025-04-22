import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import MobileContainer from "@/components/MobileContainer";
import Header from "@/components/Header";
import Navbar from "@/components/Navbar";

import api from "@/api/service";

import { Html5Qrcode } from "html5-qrcode";

import { Card, CardContent, CardTitle } from "@/components/ui/card";

import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

import { AlertCircle, CircleXIcon } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

import { Calendar as CalendarIcon } from "lucide-react";
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/components/ui/popover";

import { FileX, ScanQrCode, ArrowBigRightDashIcon } from "lucide-react";
import { format, formatDate } from "date-fns";
import { toast } from "sonner";
import { Skeleton } from "@/components/ui/skeleton";
import PageLoading from "@/components/PageLoading";
import { Calendar } from "@/components/ui/calendar";
import { useTheme } from "@/contexts/ThemeContext";
import { cn } from "@/lib/utils";

interface Kendaraan {
  id: number;
  kegiatan: string;
  reservasi_in: string;
  reservasi_out: string;
  model: string;
  no_polisi: string;
  created_at: string;
  spidometer_in: number;
  spidometer_out: number;
  total_spidometer: number;
}

interface Checkpoint {
  id: string;
  image: string;
  checkpoint_in: string;
  created_at: string;
  bbm: CheckpointBBM[];
}

interface CheckpointBBM {
  id: string;
  jenis: string;
  uang?: string;
  liter?: string;
  image: string;
  created_at: string;
}

const Index = () => {
  const { theme, toggleTheme } = useTheme();

  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [reservasi, setReservasi] = useState(false);
  const [imgBase64, setImgBase64] = useState<string | null>(null);
  const [open, setOpen] = useState<boolean>(false);
  const [openDetail, setOpenDetail] = useState<boolean>(false);

  const [date, setDate] = React.useState<Date | undefined>(new Date());
  const [openDate, setOpenDate] = React.useState(false);

  const handleDateSelect = (selectedDate?: Date) => {
    setDate(selectedDate);
    const dataDate = format(selectedDate, "yyyy-MM-dd");
    fetchDataList(dataDate);
    setOpenDate(false); // ✅ auto-close popover
  };

  const [row, setRow] = useState({
    name: "",
    no_polisi: "",
    created_at: "",
  });

  const [dataCheckpoint, setDataCheckpoint] = useState<Checkpoint[]>([]);

  const [kendaraan, setKendarran] = useState<Kendaraan[]>([]);

  useEffect(() => {
    fetchDataList("");
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/reservasi/aktif`);
      if (res.status === true) {
        setReservasi(true);
        localStorage.setItem("reservasi_id", res.items.id);
        setRow({
          name: res.items.model,
          no_polisi: res.items.no_polisi,
          created_at: res.items.created_at,
        });
      }
    } catch (error) {
      // console.error("Error fetching data:", error);
      setReservasi(false);
      localStorage.removeItem("reservasi_id");
    } finally {
      setLoading(false);
    }
  };

  const [openCamera, setOpenCamera] = useState(false);

  const config = {
    fps: 10,
    qrbox: {
      width: 250,
      height: 250,
    },
  };

  if (openCamera === true) {
    const html5QrCode = new Html5Qrcode("reader"); // Set verbose to false or true as needed

    async function startCamera() {
      try {
        const qrCodeSuccessCallback = async (decodedText: any, decodedResult: any) => {
          // console.log(`Code matched = ${decodedText}`, decodedResult);
          try {
            const res = await api.get(`reservasi/qrcode`, {
              params: {
                uniqued_id: decodedText,
              },
            });
            stopScanner();
            if (res.status === true) {
              navigate("/detail/" + res.uuid);
            }
          } catch (error) {
            // console.log('Error fetching data:', error);
            toast.info(error.response.data.message);
            stopScanner();
          }
        };

        const qrCodeErrorCallback = (errorMessage: any) => {
          // console.warn(errorMessage);
          // stopScanner();
        };

        await html5QrCode.start(
          { facingMode: "environment" },
          config,
          qrCodeSuccessCallback,
          qrCodeErrorCallback
        );
      } catch (err) {
        // console.error(err);
        toast.error(err as string);
        setOpenCamera(false);
      }
    }
    startCamera();

    function stopScanner() {
      if (html5QrCode) {
        html5QrCode
          .stop()
          .then(() => {
            setOpenCamera(false);
          })
          .catch((err: any) => {
            // console.error(err);
          });
      } else {
        alert("Html5QRCode not found");
      }
    }
  }

  const fetchDataList = async (tanggal: string) => {
    setIsLoading(true);
    try {
      const res = await api.get(`/reservasi/list`, {
        params: {
          tanggal: tanggal,
        },
      });
      if (res.status === true) {
        setKendarran(res.items);
        setIsLoading(false);
      }
    } catch (error) {
      // console.error("Error fetching data:", error);
      setKendarran([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenDialog = async (id: number, type: string) => {
    setLoading(true);
    try {
      const res = await api.get(`/reservasi/image`, {
        params: {
          id: id,
          type: type,
        },
      });

      if (res.status === true) {
        setImgBase64(res.items.data);
        setOpen(true);
      }
    } catch (error) {
      // console.log(error);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDialogDetail = async (id: number) => {
    setOpenDetail(true);
    setLoading(true);
    try {
      const res = await api.get(`/checkpoint/reservasi`, {
        params: {
          id: id,
        },
      });

      if (res.status === true) {
        setDataCheckpoint(res.items);
      }
    } catch (error) {
      // console.error("Error fetching data:", error);
      setReservasi(false);
      localStorage.removeItem("reservasi_id");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* <MobileOnlyNotice /> */}

      <Header title="Home" />
      {loading && <PageLoading />}
      <MobileContainer className="pt-20 pb-20">
        <Card className="mb-5">
          {loading ? (
            <CardContent className="p-5">
              <div className="flex flex-col space-y-3 items-center h-full">
                <Skeleton className="h-8 w-96" />
                <Skeleton className="h-8 w-96" />
              </div>
            </CardContent>
          ) : reservasi ? (
            <CardContent title="Reservasi" className="p-5">
              <div className="flex justify-between items-center mb-3">
                <h2 className="section-title">Aktif Pemakaian</h2>
                <Button
                  variant="outline"
                  className="bg-[#3a0ca3] text-white hover:bg-blue-400"
                  onClick={() => navigate("/reservasi")}>
                  <ArrowBigRightDashIcon /> Reservasi
                </Button>
              </div>
              <hr className="py-2" />
              <div className="text-center">
                <CardTitle>{row.name}</CardTitle>
                <p className="text-sm text-gray-950">{row.no_polisi}</p>
                <p className="text-sm text-gray-500">
                  {formatDate(row.created_at, "cccc, d LLL y | HH:mm")}
                </p>
              </div>
            </CardContent>
          ) : (
            <CardContent className="p-5">
              {openCamera ? null : (
                <>
                  <h2 className="text-center font-bold mb-4">
                    Silahkan Scan QRCode pada kendaraan untuk menggunakan
                  </h2>
                  <Button
                    className="w-full bg-[#3a0ca3]"
                    onClick={() => setOpenCamera(true)}>
                    <ScanQrCode /> Open Camera
                  </Button>
                </>
              )}
              <div className="flex justify-center">
                <div id="reader" className="w-full"></div>
              </div>
            </CardContent>
          )}
        </Card>

        <div className="mb-3">
          <h2 className="section-title">Recent</h2>
        </div>
        <Card className="p-1 mb-2">
          <Popover open={openDate} onOpenChange={setOpenDate}>
            <PopoverTrigger asChild>
              <Button
                variant={"outline"}
                className="w-full justify-start text-left font-normal">
                <CalendarIcon className="mr-2 h-4 w-4" />
                {date ? format(date, "PPP") : <span>Pilih tanggal</span>}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
              <Calendar
                mode="single"
                selected={date}
                onSelect={handleDateSelect} // ✅ pakai handler custom
                disabled={(date) =>
                  date > new Date() || date < new Date("1900-01-01")
                }
                initialFocus
              />
            </PopoverContent>
          </Popover>
        </Card>
        <div className="space-y-4 h-[33rem] overflow-auto scrollbar-hide">
          {isLoading ? (
            <Card className="p-4">
              <div className="flex flex-col space-y-3 items-center h-full">
                <Skeleton className="h-8 w-96" />
                <Skeleton className="h-8 w-96" />
                <Skeleton className="h-8 w-96" />
              </div>
            </Card>
          ) : kendaraan.length > 0 ? (
            kendaraan.map((item, index) => (
              <Card
                key={index}
                className="w-full bg-white shadow-md hover:shadow-lg transition duration-300 ease-in-out">
                <div className="flex justify-between items-center p-2 bg-gray-200 rounded-t-md">
                  <span className="text-sm text-gray-500">
                    {format(new Date(item.created_at), "cccc, d LLL y")}
                  </span>

                  <button
                    onClick={() => handleOpenDialogDetail(item.id)}
                    className="bg-[#3a0ca3] badge p-1 rounded text-white">
                    Detail
                  </button>
                </div>
                <CardContent className="text-center">
                  <CardTitle
                    className={cn("mt-2", theme == "dark" ? "text-black" : "")}>
                    {item.model}
                  </CardTitle>
                  <span className="text-sm text-gray-500">
                    {item.no_polisi}
                  </span>
                  <p
                    className={cn(
                      "line-clamp-3",
                      theme == "dark" ? "text-black" : ""
                    )}>
                    {item.kegiatan}
                  </p>
                  <hr className="my-2" />
                  <div
                    className={cn("mb-2", theme == "dark" ? "text-black" : "")}>
                    <p className="font-bold">Total Perjalanan</p>
                    <p className="text-sm">{item.total_spidometer} Kilometer</p>
                  </div>
                  <div className="flex gap-2 justify-center">
                    <button
                      type="button"
                      className="p-2 bg-cyan-300 hover:bg-cyan-500 shadow transition duration-300 ease-in-out hover:shadow-lg active:shadow-inner rounded-lg w-full"
                      onClick={() => handleOpenDialog(item.id, "in")}>
                      <div
                        className={cn(
                          "text-center",
                          theme == "dark" ? "text-black" : ""
                        )}>
                        <p className="font-bold">Awal</p>
                        <p className="text-sm">
                          {format(new Date(item.reservasi_in), "cccc, d LLL y")}
                        </p>
                        <p className="text-sm">
                          Jam {format(new Date(item.reservasi_in), "HH:mm")}
                        </p>
                        <p className="text-sm font-bold">
                          Spidometer {item.spidometer_in} Km
                        </p>
                      </div>
                    </button>
                    <button
                      type="button"
                      className="p-2 bg-amber-300 hover:bg-amber-500 shadow transition duration-300 ease-in-out hover:shadow-lg active:shadow-inner rounded-lg w-full"
                      onClick={() => handleOpenDialog(item.id, "out")}>
                      <div
                        className={cn(
                          "text-center",
                          theme == "dark" ? "text-black" : ""
                        )}>
                        <p className="font-bold">Akhir</p>
                        <p className="text-sm">
                          {format(
                            new Date(item.reservasi_out),
                            "cccc, d LLL y"
                          )}
                        </p>
                        <p className="text-sm">
                          Jam {format(new Date(item.reservasi_out), "HH:mm")}
                        </p>
                        <p className="text-sm font-bold">
                          Spidometer {item.spidometer_out} Km
                        </p>
                      </div>
                    </button>
                  </div>
                </CardContent>
              </Card>
            ))
          ) : (
            <Card className="p-5">
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Empty</AlertTitle>
                <AlertDescription>
                  Tidak ada list pemakaian kendaraan
                </AlertDescription>
              </Alert>
            </Card>
          )}
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Image</DialogTitle>
              <DialogDescription>
                Hasil capture spidometer kendaraan
              </DialogDescription>
            </DialogHeader>
            <img
              src={imgBase64}
              className="w-full rounded-sm"
              alt="image spidometer"
            />
            <DialogFooter className="justify-start">
              <DialogClose asChild>
                <Button
                  type="button"
                  variant="secondary"
                  className="bg-amber-300">
                  Close <CircleXIcon />
                </Button>
              </DialogClose>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <Dialog open={openDetail} onOpenChange={setOpenDetail}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Detail BBM</DialogTitle>
              <DialogDescription>
                Detail pengisian bbm pada saat pemakaian kendaraan
              </DialogDescription>
            </DialogHeader>

            <div className="overflow-auto scrollbar-hide max-h-max h-[calc(100vh-200px)]">
              {loading ? (
                <Card className="p-4">
                  <div className="flex flex-col space-y-3 items-center h-full">
                    <Skeleton className="h-8 w-96" />
                    <Skeleton className="h-8 w-96" />
                    <Skeleton className="h-8 w-96" />
                  </div>
                </Card>
              ) : dataCheckpoint.length > 0 ? (
                <Accordion
                  type="single"
                  collapsible
                  className="w-full bg-slate-300 px-5 rounded-sm">
                  {dataCheckpoint.map((item, index) => (
                    <AccordionItem value={`item-${index}`} key={index}>
                      <AccordionTrigger
                        className={cn(theme == "dark" ? "text-black" : "")}>
                        {index + 1}. Proses Pengisian BBM,
                        {format(item.created_at, "d LLL y HH:mm")}
                      </AccordionTrigger>
                      <AccordionContent>
                        <img
                          src={item.image}
                          className="w-full rounded-sm"
                          alt="img"
                        />
                        <Accordion
                          type="single"
                          collapsible
                          className="w-full bg-slate-400 px-5 rounded-b-sm">
                          {item.bbm.length > 0 ? (
                            item.bbm.map((itx, i) => (
                              <AccordionItem
                                value={`item-${index}-${i}`}
                                className="border-none"
                                key={`${index}${i}`}>
                                <AccordionTrigger className="py-2 text-white">
                                  {i + 1}. Pengisian BBM,
                                  {format(itx.created_at, "d LLL y HH:mm")}
                                </AccordionTrigger>
                                <AccordionContent className="grid rounded-sm items-center p-2">
                                  <p className="text-white text-sm">
                                    Pengisian dengan
                                    <span className="text-white font-medium ">
                                      {itx.jenis}
                                    </span>
                                    <span className=" text-white text-sm">
                                      {itx.jenis == "Voucher"
                                        ? `${itx.liter} Liter`
                                        : `Nominal Rp.${parseFloat(
                                          Number(itx.uang).toFixed(2)
                                        ).toLocaleString()}`}
                                    </span>
                                  </p>
                                  <p className="text-amber-300">Struck / Bon</p>
                                  <img
                                    src={itx.image}
                                    className="w-full rounded-sm"
                                    alt="img"
                                  />
                                </AccordionContent>
                              </AccordionItem>
                            ))
                          ) : (
                            <p className="italic">Tidak ada pengisian bbm</p>
                          )}
                        </Accordion>
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              ) : (
                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>Empty</AlertTitle>
                  <AlertDescription>
                    Tidak ada list checkpoint kendaraan
                  </AlertDescription>
                </Alert>
              )}
            </div>
            <DialogFooter className="justify-start">
              <DialogClose asChild>
                <Button
                  type="button"
                  variant="secondary"
                  className="bg-amber-300">
                  Close <CircleXIcon />
                </Button>
              </DialogClose>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </MobileContainer>

      <Navbar />
    </>
  );
};

export default Index;
